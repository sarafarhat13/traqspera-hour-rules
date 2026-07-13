// Net-to-the-minute compliance logic. NOTHING here rounds time: every duration
// is the exact difference in whole minutes between two epoch timestamps.

import type { ClockEvent } from '../types';

/** Minimum unrounded break length before a re-clock-in is "clean" (Modal Freeze). */
export const SHORT_BREAK_FREEZE_MIN = 30;

/** California-style rule: a meal break must begin before the end of the 5th hour. */
export const MEAL_COMPLIANCE_THRESHOLD_MIN = 5 * 60;

/** Warn the foreman when a worker is within this many minutes of a meal violation. */
export const MEAL_WARNING_MIN = 30;

const MS_PER_MINUTE = 60_000;

/**
 * Exact, unrounded whole-minute difference between two epoch timestamps.
 * Truncates fractional minutes toward zero — it never rounds up to the nearest
 * quarter hour or any other increment.
 */
export function netMinutesBetween(startMs: number, endMs: number): number {
  return Math.trunc((endMs - startMs) / MS_PER_MINUTE);
}

/**
 * Determines whether clocking in at `nowMs` after the most recent 'out' punch
 * would fall inside the unrounded 30-minute freeze window, requiring a reason
 * code. Returns the elapsed minutes so the UI can show the exact gap.
 */
export function evaluateReClockIn(
  events: ClockEvent[],
  nowMs: number
): { requiresReason: boolean; minutesSinceOut: number | null } {
  const lastOut = [...events].reverse().find((e) => e.type === 'out');
  if (!lastOut) {
    return { requiresReason: false, minutesSinceOut: null };
  }
  const minutesSinceOut = netMinutesBetween(lastOut.timestamp, nowMs);
  return {
    requiresReason: minutesSinceOut < SHORT_BREAK_FREEZE_MIN,
    minutesSinceOut,
  };
}

/**
 * Total net worked minutes across a set of paired in/out punches. Any trailing
 * open 'in' punch is counted up to `nowMs`.
 */
export function totalNetWorkedMinutes(events: ClockEvent[], nowMs: number): number {
  let total = 0;
  let openIn: number | null = null;
  for (const e of events) {
    if (e.type === 'in') {
      openIn = e.timestamp;
    } else if (e.type === 'out' && openIn !== null) {
      total += netMinutesBetween(openIn, e.timestamp);
      openIn = null;
    }
  }
  if (openIn !== null) {
    total += netMinutesBetween(openIn, nowMs);
  }
  return total;
}

export type MealComplianceLevel = 'ok' | 'warning' | 'violation' | 'satisfied';

export interface MealCompliance {
  level: MealComplianceLevel;
  /** Minutes remaining until a violation (negative once violated). */
  minutesRemaining: number;
  /** Continuous minutes worked used for the calculation. */
  minutesWorked: number;
}

/**
 * Evaluates meal-break compliance for a continuous work stretch.
 * A worker must start a meal before completing 5 unrounded hours of work.
 */
export function evaluateMealCompliance(
  clockInMs: number,
  nowMs: number,
  mealTakenMs: number | null
): MealCompliance {
  const minutesWorked = netMinutesBetween(clockInMs, nowMs);

  if (mealTakenMs !== null) {
    const minutesToMeal = netMinutesBetween(clockInMs, mealTakenMs);
    return {
      level: minutesToMeal <= MEAL_COMPLIANCE_THRESHOLD_MIN ? 'satisfied' : 'violation',
      minutesRemaining: MEAL_COMPLIANCE_THRESHOLD_MIN - minutesToMeal,
      minutesWorked,
    };
  }

  const minutesRemaining = MEAL_COMPLIANCE_THRESHOLD_MIN - minutesWorked;
  let level: MealComplianceLevel = 'ok';
  if (minutesRemaining <= 0) level = 'violation';
  else if (minutesRemaining <= MEAL_WARNING_MIN) level = 'warning';

  return { level, minutesRemaining, minutesWorked };
}

/** Formats a signed minute count as `H:MM` (or `-H:MM`), never rounding. */
export function formatMinutes(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}

/** Short mm:ss-free countdown label, e.g. "27m" or "-4m (over)". */
export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return `${Math.abs(minutes)}m over`;
  return `${minutes}m`;
}
