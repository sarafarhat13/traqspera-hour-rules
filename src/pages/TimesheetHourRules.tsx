import {
  ModusWcButton,
  ModusWcSelect,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react';
import HourRulesSection from '../components/hourRules/HourRulesSection';
import HourRulePrecedence from '../components/hourRules/HourRulePrecedence';
import DailyRulesGrid from '../components/hourRules/DailyRulesGrid';
import WeeklyRulesRow from '../components/hourRules/WeeklyRulesRow';
import BreakRulesRow from '../components/hourRules/BreakRulesRow';
import MealPeriodRulesBlock from '../components/hourRules/MealPeriodRulesBlock';
import { useLaborRules } from '../hooks/useLaborRules';
import { US_STATES, UNIONS } from '../data/defaultLaborRules';
import type { DailyHourRule, LaborRulesState, MealPeriodPolicy, RestBreakPolicy } from '../types/laborRules';
import { readStringValue } from '../lib/events';

interface RulesBodyProps {
  rules: LaborRulesState;
  updateRules: (patch: Partial<LaborRulesState>) => void;
  updateRest: (patch: Partial<RestBreakPolicy>) => void;
  updateKioskRest: (patch: Partial<RestBreakPolicy>) => void;
  updateMeal: (patch: Partial<MealPeriodPolicy>) => void;
}

function RulesBody({ rules, updateRules, updateRest, updateKioskRest, updateMeal }: RulesBodyProps) {
  const setDaily = (
    key: keyof typeof rules.dailyRules,
    field: keyof DailyHourRule,
    value: string
  ) => {
    updateRules({
      dailyRules: {
        ...rules.dailyRules,
        [key]: { ...rules.dailyRules[key], [field]: value },
      },
    });
  };

  const setWeekly = (field: keyof typeof rules.weeklyRules, value: string) => {
    updateRules({ weeklyRules: { ...rules.weeklyRules, [field]: value } });
  };

  return (
    <>
      <DailyRulesGrid rules={rules.dailyRules} onChange={setDaily} />
      <WeeklyRulesRow rules={rules.weeklyRules} onChange={setWeekly} />

      <div className="hour-rules-subsection">
        <h3 className="hour-rules-subtitle">Break Rules</h3>
        <BreakRulesRow
          description="Choose whether entries will be flagged or have the break automatically added (Use Automatic Hour Rule Rollover setting must be on). Enter the minimum number of hours worked in a day that a break must be taken for and length of the required break."
          minimumHours={rules.restBreak.minimumHoursPerDay}
          breakLengthHours={rules.restBreak.breakLengthHours}
          action={rules.restBreak.action}
          onMinimumHoursChange={(v) => updateRest({ minimumHoursPerDay: v, accrualHours: v })}
          onBreakLengthChange={(v) =>
            updateRest({ breakLengthHours: v, minutesPerBreak: Math.round(v * 60) })
          }
          onActionChange={(action) => updateRest({ action })}
        />
      </div>

      <div className="hour-rules-subsection">
        <h3 className="hour-rules-subtitle">Kiosk Shift Break Rules</h3>
        <BreakRulesRow
          description="Break rules for shift entries created from a kiosk."
          minimumHours={rules.kioskRestBreak.minimumHoursPerDay}
          breakLengthHours={rules.kioskRestBreak.breakLengthHours}
          action={rules.kioskRestBreak.action}
          onMinimumHoursChange={(v) =>
            updateKioskRest({ minimumHoursPerDay: v, accrualHours: v })
          }
          onBreakLengthChange={(v) =>
            updateKioskRest({ breakLengthHours: v, minutesPerBreak: Math.round(v * 60) })
          }
          onActionChange={(action) => updateKioskRest({ action })}
        />
      </div>

      <div className="hour-rules-subsection">
        <h3 className="hour-rules-subtitle">Equipment Rules</h3>
        <ModusWcTextInput
          label="Maximum Hours Per Day"
          value={rules.equipmentMaxHoursPerDay}
          onInputChange={(e) => updateRules({ equipmentMaxHoursPerDay: readStringValue(e) })}
        />
      </div>

      <MealPeriodRulesBlock policy={rules.mealPeriod} onChange={updateMeal} />
    </>
  );
}

export default function TimesheetHourRules() {
  const { rules, updateRules, updateRest, updateKioskRest, updateMeal, save, saved } =
    useLaborRules();

  const bodyProps = { rules, updateRules, updateRest, updateKioskRest, updateMeal };

  return (
    <div className="hour-rules-page traqspera-hour-rules">
      <div className="hour-rules-page-top">
        <h1>Timesheet Hour Rules</h1>
        <div className="hour-rules-save-wrap">
          {saved && <span className="sig-preserved">Saved</span>}
          <ModusWcButton color="primary" onButtonClick={save}>
            Save
          </ModusWcButton>
        </div>
      </div>

      <HourRulePrecedence
        order={rules.precedence}
        custom={rules.useCustomPrecedenceOrder}
        onCustomChange={(useCustomPrecedenceOrder) => updateRules({ useCustomPrecedenceOrder })}
      />

      <HourRulesSection title="Company Timesheet Hour Rules">
        <RulesBody {...bodyProps} />
      </HourRulesSection>

      <HourRulesSection title="State Timesheet Hour Rules">
        <div className="state-rules-toolbar">
          <p>You may specify different rules for each individual State.</p>
          <ModusWcSelect
            label="Select a State"
            value={rules.selectedState}
            options={US_STATES}
            onInputChange={(e) => updateRules({ selectedState: readStringValue(e) })}
          />
        </div>
        {rules.selectedState === 'OR' ? (
          <RulesBody {...bodyProps} />
        ) : (
          <p className="break-rules-desc">
            Oregon meal and rest defaults are configured for OR. Select Oregon to edit BOLI-compliant
            rules.
          </p>
        )}
      </HourRulesSection>

      <HourRulesSection title="Union Timesheet Hour Rules">
        <div className="state-rules-toolbar">
          <p>You may specify different rules for each individual Union.</p>
          <ModusWcSelect
            label="Select a Union"
            value={rules.selectedUnion}
            options={UNIONS}
            onInputChange={(e) => updateRules({ selectedUnion: readStringValue(e) })}
          />
        </div>
        {rules.selectedUnion ? (
          <p className="break-rules-desc">
            Union override for <strong>{rules.selectedUnion}</strong> inherits company rules until
            customized.
          </p>
        ) : (
          <p className="break-rules-desc">Select a union to configure union-specific overrides.</p>
        )}
      </HourRulesSection>
    </div>
  );
}
