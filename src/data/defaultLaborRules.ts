import type { LaborRulesState } from '../types/laborRules';

export const DEFAULT_LABOR_RULES: LaborRulesState = {
  restBreak: {
    name: 'Oregon Rest Break Policy',
    enabled: true,
    minutesPerBreak: 10,
    accrualHours: 4,
    majorFractionEnabled: true,
    majorFractionHours: 2,
    paid: true,
    minDurationMinutes: 10,
    uninterrupted: true,
    placement: 'distribute',
    minGapBetweenRestsMinutes: 60,
    cannotOverlapMeal: true,
    monitorActualUse: true,
    requireManagerAckOnMiss: true,
    exceptions: {
      unforeseeableEvent: true,
      soloNoRelief: false,
      unionCba: false,
      voluntarySkip: false,
    },
    enforcement: {
      treatUnderMinAsMissed: true,
      missedRestPremiumMinutes: 60,
    },
  },
  mealPeriod: {
    name: 'Oregon Meal Period Policy',
    enabled: true,
    firstMealAfterHours: 6,
    secondMealAfterHours: 14,
    minDurationMinutes: 30,
    uninterrupted: true,
    relievedOfDuties: true,
    timingBands: [
      {
        id: 'band-6-7',
        shiftMinHours: 6,
        shiftMaxHours: 7,
        mealStartAfterHour: 2,
        mealStartBeforeHour: 5,
      },
      {
        id: 'band-7-plus',
        shiftMinHours: 7,
        shiftMaxHours: null,
        mealStartAfterHour: 3,
        mealStartBeforeHour: 6,
      },
    ],
    strictLiability: true,
    strictLiabilityPayMinutes: 30,
    monitorActualUse: true,
    requireManagerAckOnMiss: true,
    exceptions: {
      unforeseeableEvent: true,
      industryCustomPaid: true,
      industryCustomMinMinutes: 20,
      industryCustomMaxMinutes: 29,
      undueHardshipWh161: true,
      tippedServerWaiver: true,
    },
  },
};

export const LABOR_RULES_STORAGE_KEY = 'traqspera-labor-rules';
