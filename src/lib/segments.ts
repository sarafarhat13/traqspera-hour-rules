import type {
  ClockEvent,
  DayComplianceLevel,
  DaySummary,
  SegmentType,
  TeamRollup,
  TimeSegment,
  TimesheetEmployee,
} from '../types';
import {
  MEAL_COMPLIANCE_THRESHOLD_MIN,
  SHORT_BREAK_FREEZE_MIN,
  netMinutesBetween,
} from './timeRules';

/** Gaps at or above this many unrounded minutes are treated as a meal break. */
const MEAL_GAP_MIN = 45;

const OT_THRESHOLD_MIN = 8 * 60;

const SEGMENT_LABEL: Record<SegmentType, string> = {
  work: 'Work',
  rest: 'Rest',
  meal: 'Meal',
  working_lunch: 'Working Lunch',
};

export function segmentTypeLabel(type: SegmentType): string {
  return SEGMENT_LABEL[type];
}

export function formatClockTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Derives ordered work and break segments from raw in/out punches.
 * Every duration is net-to-the-minute; nothing is rounded.
 */
export function buildSegmentsFromEvents(
  events: ClockEvent[],
  coding?: { jobCode?: string; phaseCode?: string; unionCode?: string }
): TimeSegment[] {
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const segments: TimeSegment[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const punch = sorted[i];
    if (punch.type !== 'in') continue;

    const outIdx = sorted.findIndex((e, j) => j > i && e.type === 'out');
    const out = outIdx >= 0 ? sorted[outIdx] : null;

    if (out) {
      segments.push({
        id: `work-${punch.timestamp}`,
        type: 'work',
        startMs: punch.timestamp,
        endMs: out.timestamp,
        netMinutes: netMinutesBetween(punch.timestamp, out.timestamp),
        craft: punch.craft,
        jobCode: coding?.jobCode,
        phaseCode: coding?.phaseCode,
        unionCode: coding?.unionCode,
        status: 'approved',
        flags: [],
      });

      const nextIn = sorted.find((e, j) => j > outIdx && e.type === 'in');
      if (nextIn) {
        segments.push(classifyGap(out.timestamp, nextIn));
      }
    }
  }

  return segments;
}

function classifyGap(outMs: number, nextIn: ClockEvent): TimeSegment {
  const gapMin = netMinutesBetween(outMs, nextIn.timestamp);
  const flags: string[] = [];
  let type: SegmentType = 'rest';
  let status: TimeSegment['status'] = 'approved';

  if (gapMin < SHORT_BREAK_FREEZE_MIN) {
    if (nextIn.reasonCode === 'working_lunch') {
      type = 'working_lunch';
    } else {
      flags.push('Short break < 30m');
      status = 'flagged';
      if (nextIn.reasonCode) {
        flags.push(reasonLabel(nextIn.reasonCode));
      }
    }
  } else if (gapMin >= MEAL_GAP_MIN) {
    type = 'meal';
  }

  return {
    id: `gap-${outMs}`,
    type,
    startMs: outMs,
    endMs: nextIn.timestamp,
    netMinutes: gapMin,
    reasonCode: nextIn.reasonCode,
    flags,
    status,
  };
}

function reasonLabel(code: NonNullable<ClockEvent['reasonCode']>): string {
  const map = {
    working_lunch: 'Working Lunch',
    operational_flow: 'Operational Flow',
    personal_choice: 'Personal Choice',
  };
  return map[code];
}

export function summarizeDay(
  dateKey: string,
  label: string,
  segments: TimeSegment[],
  attestationComplete: boolean
): DaySummary {
  const restMinutes = segments
    .filter((s) => s.type === 'rest' || s.type === 'working_lunch')
    .reduce((sum, s) => sum + s.netMinutes, 0);
  const mealMinutes = segments
    .filter((s) => s.type === 'meal')
    .reduce((sum, s) => sum + s.netMinutes, 0);
  const netWorkMinutes = segments
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.netMinutes, 0);

  const complianceLevel = evaluateDayCompliance(segments);
  const hasFlags = segments.some((s) => s.flags.length > 0 || s.status === 'flagged');

  return {
    dateKey,
    label,
    attestationComplete,
    restMinutes,
    mealMinutes,
    netWorkMinutes,
    segments,
    complianceLevel: hasFlags ? 'violation' : complianceLevel,
  };
}

function evaluateDayCompliance(segments: TimeSegment[]): DayComplianceLevel {
  const work = segments.filter((s) => s.type === 'work');
  if (work.length === 0) return 'ok';

  const dayStart = work[0].startMs;
  const firstMeal = segments.find((s) => s.type === 'meal');

  if (!firstMeal) {
    const totalWork = work.reduce((sum, s) => sum + s.netMinutes, 0);
    if (totalWork > MEAL_COMPLIANCE_THRESHOLD_MIN) return 'violation';
    if (totalWork > MEAL_COMPLIANCE_THRESHOLD_MIN - 30) return 'warning';
    return 'ok';
  }

  const minutesToMeal = netMinutesBetween(dayStart, firstMeal.startMs);
  if (minutesToMeal > MEAL_COMPLIANCE_THRESHOLD_MIN) return 'violation';
  return 'ok';
}

/** Aggregates all employees into Workyard-style summary tile values. */
export function computeTeamRollup(employees: TimesheetEmployee[]): TeamRollup {
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let breakMinutes = 0;
  let mealMinutes = 0;
  let flaggedCount = 0;

  for (const emp of employees) {
    for (const day of emp.days) {
      regularMinutes += Math.min(day.netWorkMinutes, OT_THRESHOLD_MIN);
      overtimeMinutes += Math.max(day.netWorkMinutes - OT_THRESHOLD_MIN, 0);
      breakMinutes += day.restMinutes;
      mealMinutes += day.mealMinutes;

      const dayFlagged =
        day.complianceLevel !== 'ok' ||
        day.segments.some((s) => s.status === 'flagged' || s.flags.length > 0);
      if (dayFlagged) flaggedCount += 1;
    }
  }

  return {
    teamMembers: employees.length,
    regularMinutes,
    overtimeMinutes,
    breakMinutes,
    mealMinutes,
    totalMinutes: regularMinutes + overtimeMinutes,
    flaggedCount,
  };
}

/** Builds timeline strip segments as fractional widths for one day. */
export function timelineParts(
  day: DaySummary
): { type: SegmentType; flagged: boolean; pct: number }[] {
  const total = day.segments.reduce((sum, s) => sum + Math.max(s.netMinutes, 1), 0);
  return day.segments.map((s) => ({
    type: s.type,
    flagged: s.status === 'flagged' || s.flags.length > 0,
    pct: (Math.max(s.netMinutes, 1) / total) * 100,
  }));
}
