import type { ClockEvent, TimesheetEmployee } from '../types';
import { buildSegmentsFromEvents, summarizeDay } from '../lib/segments';

/** Demo day: today at local midnight. */
function dayBase(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function at(hour: number, minute: number): number {
  const base = dayBase();
  return base.getTime() + hour * 3_600_000 + minute * 60_000;
}

function dayLabel(): string {
  return dayBase().toLocaleDateString([], { weekday: 'short', day: 'numeric' });
}

function dayKey(): string {
  return dayBase().toISOString().slice(0, 10);
}

function employeeDay(
  id: string,
  employeeNumber: string,
  name: TimesheetEmployee['name'],
  craft: TimesheetEmployee['craft'],
  events: ClockEvent[],
  coding: { jobCode: string; phaseCode: string; unionCode: string },
  attestationComplete: boolean
): TimesheetEmployee {
  const segments = buildSegmentsFromEvents(events, coding);
  return {
    id,
    employeeNumber,
    name,
    craft,
    days: [summarizeDay(dayKey(), dayLabel(), segments, attestationComplete)],
  };
}

// Josh Allen — long shift, compliant meal, full attestation (Traqspera-style).
const joshEvents: ClockEvent[] = [
  { type: 'in', timestamp: at(9, 26), craft: 'Carpenter' },
  { type: 'out', timestamp: at(12, 14), craft: 'Carpenter' },
  { type: 'in', timestamp: at(12, 34), craft: 'Carpenter' },
  { type: 'out', timestamp: at(17, 2), craft: 'Carpenter' },
  { type: 'in', timestamp: at(17, 38), craft: 'Carpenter' },
  { type: 'out', timestamp: at(21, 26), craft: 'Carpenter' },
];

// James Okoro — missed meal window, short break with reason code.
const jamesEvents: ClockEvent[] = [
  { type: 'in', timestamp: at(6, 0), craft: 'Carpenter' },
  { type: 'out', timestamp: at(11, 30), craft: 'Carpenter' },
  { type: 'in', timestamp: at(11, 48), craft: 'Carpenter', reasonCode: 'operational_flow' },
  { type: 'out', timestamp: at(16, 45), craft: 'Carpenter' },
  { type: 'in', timestamp: at(16, 50), craft: 'Carpenter', reasonCode: 'personal_choice' },
  { type: 'out', timestamp: at(18, 0), craft: 'Carpenter' },
];

// Wei Chen — on lunch, clean breaks and meal.
const weiEvents: ClockEvent[] = [
  { type: 'in', timestamp: at(7, 0), craft: 'Laborer' },
  { type: 'out', timestamp: at(10, 15), craft: 'Laborer' },
  { type: 'in', timestamp: at(10, 35), craft: 'Laborer' },
  { type: 'out', timestamp: at(12, 0), craft: 'Laborer' },
  { type: 'in', timestamp: at(12, 50), craft: 'Laborer' },
  { type: 'out', timestamp: at(15, 30), craft: 'Laborer' },
];

// Maria Alvarez — working lunch (short gap, paid lunch reason).
const mariaEvents: ClockEvent[] = [
  { type: 'in', timestamp: at(8, 0), craft: 'Electrician' },
  { type: 'out', timestamp: at(12, 0), craft: 'Electrician' },
  { type: 'in', timestamp: at(12, 20), craft: 'Electrician', reasonCode: 'working_lunch' },
  { type: 'out', timestamp: at(16, 30), craft: 'Electrician' },
];

export const TIMESHEET_EMPLOYEES: TimesheetEmployee[] = [
  employeeDay('e1', '633', 'Josh Allen', 'Carpenter', joshEvents, {
    jobCode: '104',
    phaseCode: '03-3000',
    unionCode: 'UBC-721',
  }, false),
  employeeDay('e2', '218', 'James Okoro', 'Carpenter', jamesEvents, {
    jobCode: '104',
    phaseCode: '06-1000',
    unionCode: 'UBC-721',
  }, false),
  employeeDay('e3', '441', 'Wei Chen', 'Laborer', weiEvents, {
    jobCode: '88',
    phaseCode: '02-2200',
    unionCode: 'LIUNA-89',
  }, true),
  employeeDay('e4', '512', 'Maria Alvarez', 'Electrician', mariaEvents, {
    jobCode: '201',
    phaseCode: '03-3000',
    unionCode: 'IBEW-11',
  }, true),
];

export const TIMESHEET_DATE_LABEL = dayBase().toLocaleDateString([], {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
