export type RuleAction = 'flag' | 'auto_apply';

export type PrecedenceLevel = 'company' | 'union' | 'state';

export interface DailyHourRule {
  totalHours: string;
  regHours: string;
  otHours: string;
  dtHours: string;
  travelHours: string;
}

export interface WeeklyHourRule {
  totalHours: string;
  regHours: string;
  otHours: string;
  dtHours: string;
  travelHours: string;
}

/** Oregon-style rest break policy (admin-configurable). */
export interface RestBreakPolicy {
  name: string;
  enabled: boolean;
  /** Minimum hours worked before a rest is required (Traqspera: per day block). */
  minimumHoursPerDay: number;
  /** Break length in hours (e.g. 0.17 ≈ 10 minutes). */
  breakLengthHours: number;
  action: RuleAction;
  minutesPerBreak: number;
  accrualHours: number;
  majorFractionEnabled: boolean;
  majorFractionHours: number;
  paid: boolean;
  minDurationMinutes: number;
  uninterrupted: boolean;
  placement: 'distribute' | 'fixed' | 'manager';
  minGapBetweenRestsMinutes: number;
  cannotOverlapMeal: boolean;
  monitorActualUse: boolean;
  requireManagerAckOnMiss: boolean;
  exceptions: {
    unforeseeableEvent: boolean;
    soloNoRelief: boolean;
    unionCba: boolean;
    voluntarySkip: boolean;
  };
  enforcement: {
    treatUnderMinAsMissed: boolean;
    missedRestPremiumMinutes: number;
  };
}

export interface MealTimingBand {
  id: string;
  shiftMinHours: number;
  shiftMaxHours: number | null;
  mealStartAfterHour: number;
  mealStartBeforeHour: number;
}

/** Oregon-style meal period policy (admin-configurable). */
export interface MealPeriodPolicy {
  name: string;
  enabled: boolean;
  minimumHoursPerDay: number;
  breakLengthHours: number;
  action: RuleAction;
  firstMealAfterHours: number;
  secondMealAfterHours: number;
  secondMealMinimumHours: number;
  secondMealLengthHours: number;
  secondMealAction: RuleAction;
  minDurationMinutes: number;
  uninterrupted: boolean;
  relievedOfDuties: boolean;
  timingBands: MealTimingBand[];
  strictLiability: boolean;
  strictLiabilityPayMinutes: number;
  monitorActualUse: boolean;
  requireManagerAckOnMiss: boolean;
  exceptions: {
    unforeseeableEvent: boolean;
    industryCustomPaid: boolean;
    industryCustomMinMinutes: number;
    industryCustomMaxMinutes: number;
    undueHardshipWh161: boolean;
    tippedServerWaiver: boolean;
  };
}

export interface LaborRulesState {
  useCustomPrecedenceOrder: boolean;
  precedence: PrecedenceLevel[];
  selectedState: string;
  selectedUnion: string;
  dailyRules: {
    weekday: DailyHourRule;
    saturday: DailyHourRule;
    sunday: DailyHourRule;
    seventhDay: DailyHourRule;
  };
  weeklyRules: WeeklyHourRule;
  equipmentMaxHoursPerDay: string;
  restBreak: RestBreakPolicy;
  kioskRestBreak: RestBreakPolicy;
  mealPeriod: MealPeriodPolicy;
}
