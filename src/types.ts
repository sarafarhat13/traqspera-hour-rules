// Shared domain model for the Traqspera Hour Rules compliance app.

/** Trade classifications an employee can be assigned to during a shift. */
export type Craft =
  | 'Carpenter'
  | 'Electrician'
  | 'Laborer'
  | 'Operator'
  | 'Plumber'
  | 'Ironworker';

export const CRAFTS: Craft[] = [
  'Carpenter',
  'Electrician',
  'Laborer',
  'Operator',
  'Plumber',
  'Ironworker',
];

/**
 * Reason codes required when an employee clocks back in before the unrounded
 * 30-minute break threshold has elapsed ("Modal Freeze").
 */
export type ReasonCode = 'working_lunch' | 'operational_flow' | 'personal_choice';

export const REASON_CODES: { value: ReasonCode; label: string }[] = [
  { value: 'working_lunch', label: 'Working Lunch' },
  { value: 'operational_flow', label: 'Operational Flow' },
  { value: 'personal_choice', label: 'Personal Choice' },
];

/** A single punch on a timecard. Timestamps are epoch milliseconds. */
export interface ClockEvent {
  type: 'in' | 'out';
  timestamp: number;
  craft: Craft;
  /** Present only on an 'in' punch that triggered the short-break modal freeze. */
  reasonCode?: ReasonCode;
}

/** Live crew status used by the foreman dashboard and heat map. */
export type CrewStatus = 'active' | 'lunch' | 'shift_end';

export interface CrewMember {
  id: string;
  name: string;
  craft: Craft;
  status: CrewStatus;
  /** Epoch ms when the current continuous work stretch began. */
  clockInAt: number;
  /** Epoch ms of the most recent meal break start, if any. */
  lastMealAt: number | null;
  /** Grid position for the heat map (col/row). */
  zone: string;
}

/** Admin timecard record for the management-by-exception dashboard. */
export interface Timecard {
  id: string;
  employee: string;
  craft: Craft;
  unionCode: string;
  phaseCode: string;
  netMinutes: number;
  /** Digital signature hash; preserved unless the union code changes. */
  signature: string | null;
  signedBy: string | null;
  flags: string[];
}

export interface AttestationState {
  tookRestBreaks: boolean;
  tookMealBreak: boolean;
  injuryOccurred: boolean;
  injuryComments: string;
}

/** Segment classification for manager timesheet views. */
export type SegmentType = 'work' | 'rest' | 'meal' | 'working_lunch';

export type SegmentStatus = 'approved' | 'pending' | 'flagged';

/** A single work or break block derived from clock punches (net-to-the-minute). */
export interface TimeSegment {
  id: string;
  type: SegmentType;
  startMs: number;
  endMs: number;
  netMinutes: number;
  reasonCode?: ReasonCode;
  craft?: Craft;
  jobCode?: string;
  phaseCode?: string;
  unionCode?: string;
  status: SegmentStatus;
  flags: string[];
}

export type DayComplianceLevel = 'ok' | 'warning' | 'violation';

/** Per-day rollup for one employee on the timesheet summary. */
export interface DaySummary {
  dateKey: string;
  label: string;
  attestationComplete: boolean;
  restMinutes: number;
  mealMinutes: number;
  netWorkMinutes: number;
  segments: TimeSegment[];
  complianceLevel: DayComplianceLevel;
}

/** Employee record for the timesheet summary page. */
export interface TimesheetEmployee {
  id: string;
  employeeNumber: string;
  name: string;
  craft: Craft;
  days: DaySummary[];
}

/** Team-level KPI rollup (Workyard-style summary tiles). */
export interface TeamRollup {
  teamMembers: number;
  regularMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  mealMinutes: number;
  totalMinutes: number;
  flaggedCount: number;
}
