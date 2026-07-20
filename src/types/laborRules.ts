/** Oregon-style rest break policy (admin-configurable). */
export interface RestBreakPolicy {
  name: string;
  enabled: boolean;
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
  firstMealAfterHours: number;
  secondMealAfterHours: number;
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
  restBreak: RestBreakPolicy;
  mealPeriod: MealPeriodPolicy;
}
