import type { DailyHourRule, LaborRulesState, WeeklyHourRule } from '../types/laborRules';

const EMPTY_DAY: DailyHourRule = {
  totalHours: '',
  regHours: '',
  otHours: '',
  dtHours: '',
  travelHours: '',
};

const WEEKLY: WeeklyHourRule = {
  totalHours: '55',
  regHours: '40',
  otHours: '10',
  dtHours: '5',
  travelHours: '',
};

const REST_BASE = {
  name: 'Rest Break',
  enabled: true,
  minimumHoursPerDay: 4,
  breakLengthHours: 0.17,
  action: 'flag' as const,
  minutesPerBreak: 10,
  accrualHours: 4,
  majorFractionEnabled: true,
  majorFractionHours: 2,
  paid: true,
  minDurationMinutes: 10,
  uninterrupted: true,
  placement: 'distribute' as const,
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
};

export const DEFAULT_LABOR_RULES: LaborRulesState = {
  useCustomPrecedenceOrder: false,
  precedence: ['company', 'union', 'state'],
  selectedState: 'OR',
  selectedUnion: '',
  dailyRules: {
    weekday: { ...EMPTY_DAY, regHours: '8', otHours: '4' },
    saturday: { ...EMPTY_DAY },
    sunday: { ...EMPTY_DAY },
    seventhDay: { ...EMPTY_DAY },
  },
  weeklyRules: { ...WEEKLY },
  equipmentMaxHoursPerDay: '',
  restBreak: { ...REST_BASE, name: 'Company Rest Break' },
  kioskRestBreak: { ...REST_BASE, name: 'Kiosk Shift Rest Break' },
  mealPeriod: {
    name: 'Meal Period',
    enabled: true,
    minimumHoursPerDay: 6,
    breakLengthHours: 0.5,
    action: 'flag',
    firstMealAfterHours: 6,
    secondMealAfterHours: 14,
    secondMealMinimumHours: 14,
    secondMealLengthHours: 0.5,
    secondMealAction: 'flag',
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

export const US_STATES = [
  { label: 'OR - Oregon', value: 'OR' },
  { label: 'CA - California', value: 'CA' },
  { label: 'WA - Washington', value: 'WA' },
];

export const UNIONS = [
  { label: '— Select a Union —', value: '' },
  { label: 'UBC-721 Carpenters', value: 'UBC-721' },
  { label: 'IBEW-11 Electricians', value: 'IBEW-11' },
  { label: 'LIUNA-89 Laborers', value: 'LIUNA-89' },
];
