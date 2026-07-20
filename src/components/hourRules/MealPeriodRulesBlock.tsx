import {
  ModusWcCheckbox,
  ModusWcNumberInput,
  ModusWcSwitch,
  ModusWcAlert,
} from '@trimble-oss/moduswebcomponents-react';
import BreakRulesRow from './BreakRulesRow';
import type { MealPeriodPolicy, MealTimingBand } from '../../types/laborRules';
import { readBooleanValue } from '../../lib/events';

function readNumber(e: { target: EventTarget | null }): number {
  const host = e.target as unknown as { value?: number | string };
  const raw = host?.value;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

interface MealPeriodRulesBlockProps {
  policy: MealPeriodPolicy;
  onChange: (patch: Partial<MealPeriodPolicy>) => void;
}

function updateBand(
  bands: MealTimingBand[],
  id: string,
  patch: Partial<MealTimingBand>
): MealTimingBand[] {
  return bands.map((b) => (b.id === id ? { ...b, ...patch } : b));
}

export default function MealPeriodRulesBlock({ policy, onChange }: MealPeriodRulesBlockProps) {
  const setException = (key: keyof MealPeriodPolicy['exceptions'], value: boolean) => {
    onChange({ exceptions: { ...policy.exceptions, [key]: value } });
  };

  return (
    <div className="hour-rules-subsection">
      <h3 className="hour-rules-subtitle">Meal Period Rules</h3>
      <p className="break-rules-desc">
        Required for work periods of 6 hours or more. A second meal is required at 14 hours. Meals
        must be at least 30 minutes, uninterrupted, with the employee relieved of all duties.
        Choose whether entries will be flagged or have the meal automatically applied (Use
        Automatic Hour Rule Rollover setting must be on).
      </p>

      <BreakRulesRow
        description="First meal period"
        minimumHours={policy.minimumHoursPerDay}
        breakLengthHours={policy.breakLengthHours}
        action={policy.action}
        onMinimumHoursChange={(v) => onChange({ minimumHoursPerDay: v, firstMealAfterHours: v })}
        onBreakLengthChange={(v) =>
          onChange({
            breakLengthHours: v,
            minDurationMinutes: Math.round(v * 60),
          })
        }
        onActionChange={(action) => onChange({ action })}
      />

      <BreakRulesRow
        description="Second meal period (14+ hour shifts)"
        minimumHours={policy.secondMealMinimumHours}
        breakLengthHours={policy.secondMealLengthHours}
        action={policy.secondMealAction}
        onMinimumHoursChange={(v) =>
          onChange({ secondMealMinimumHours: v, secondMealAfterHours: v })
        }
        onBreakLengthChange={(v) => onChange({ secondMealLengthHours: v })}
        onActionChange={(secondMealAction) => onChange({ secondMealAction })}
      />

      <h4 className="hour-rules-mini-title">Timing windows</h4>
      <p className="break-rules-desc">
        For a 6 to under-7 hour shift, the meal must start after the 2nd hour and before the 5th.
        For shifts longer than 7 hours, after the 3rd hour and before the 6th.
      </p>
      {policy.timingBands.map((band) => (
        <div key={band.id} className="timing-band-inline">
          <span className="timing-band-label">
            Shift {band.shiftMinHours}h
            {band.shiftMaxHours !== null ? ` – under ${band.shiftMaxHours}h` : '+'}
          </span>
          <ModusWcNumberInput
            label="Start after hour"
            value={String(band.mealStartAfterHour)}
            min={0}
            max={12}
            onInputChange={(e) =>
              onChange({
                timingBands: updateBand(policy.timingBands, band.id, {
                  mealStartAfterHour: readNumber(e),
                }),
              })
            }
          />
          <ModusWcNumberInput
            label="Start before hour"
            value={String(band.mealStartBeforeHour)}
            min={1}
            max={14}
            onInputChange={(e) =>
              onChange({
                timingBands: updateBand(policy.timingBands, band.id, {
                  mealStartBeforeHour: readNumber(e),
                }),
              })
            }
          />
        </div>
      ))}

      <h4 className="hour-rules-mini-title">Exceptions to 30-minute requirement</h4>
      <div className="exception-list compact">
        <ModusWcCheckbox
          label="(a) Unforeseeable events"
          value={policy.exceptions.unforeseeableEvent}
          onInputChange={(e) => setException('unforeseeableEvent', readBooleanValue(e))}
        />
        <ModusWcCheckbox
          label="(b) Industry custom paid meal (20–29 minutes)"
          value={policy.exceptions.industryCustomPaid}
          onInputChange={(e) => setException('industryCustomPaid', readBooleanValue(e))}
        />
        <ModusWcCheckbox
          label="(c) Undue hardship — BOLI Form WH-161"
          value={policy.exceptions.undueHardshipWh161}
          onInputChange={(e) => setException('undueHardshipWh161', readBooleanValue(e))}
        />
        <ModusWcCheckbox
          label="(d) Tipped server waiver (BOLI form)"
          value={policy.exceptions.tippedServerWaiver}
          onInputChange={(e) => setException('tippedServerWaiver', readBooleanValue(e))}
        />
      </div>

      <div className="policy-grid compact">
        <ModusWcSwitch
          label="Strict liability (1 min short = pay full 30 min)"
          value={policy.strictLiability}
          onInputChange={(e) => onChange({ strictLiability: readBooleanValue(e) })}
        />
        <ModusWcSwitch
          label="Monitor that meals are actually taken"
          value={policy.monitorActualUse}
          onInputChange={(e) => onChange({ monitorActualUse: readBooleanValue(e) })}
        />
      </div>

      {policy.strictLiability && (
        <ModusWcAlert
          variant="warning"
          alertTitle="Maza / Pelican Brewing"
          alertDescription="If a meal is even one minute short of 30, the employer must pay for the entire 30 minutes unless a documented exception applies."
        />
      )}
    </div>
  );
}
