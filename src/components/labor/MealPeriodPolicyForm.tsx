import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcNumberInput,
  ModusWcSwitch,
} from '@trimble-oss/moduswebcomponents-react';
import PolicySection from './PolicySection';
import type { MealPeriodPolicy, MealTimingBand } from '../../types/laborRules';
import { readBooleanValue } from '../../lib/events';

function readNumber(e: { target: EventTarget | null }): number {
  const host = e.target as unknown as { value?: number | string };
  const raw = host?.value;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

interface MealPeriodPolicyFormProps {
  policy: MealPeriodPolicy;
  onChange: (patch: Partial<MealPeriodPolicy>) => void;
  onSave: () => void;
  onReset: () => void;
  saved: boolean;
}

function updateBand(
  bands: MealTimingBand[],
  id: string,
  patch: Partial<MealTimingBand>
): MealTimingBand[] {
  return bands.map((b) => (b.id === id ? { ...b, ...patch } : b));
}

export default function MealPeriodPolicyForm({
  policy,
  onChange,
  onSave,
  onReset,
  saved,
}: MealPeriodPolicyFormProps) {
  const setException = (key: keyof MealPeriodPolicy['exceptions'], value: boolean) => {
    onChange({ exceptions: { ...policy.exceptions, [key]: value } });
  };

  return (
    <div className="labor-rules-page">
      <div className="policy-summary panel">
        <h2>{policy.name}</h2>
        <p>
          Required after <strong>{policy.firstMealAfterHours}h</strong>
          {policy.secondMealAfterHours > 0 && (
            <>
              {' '}
              · 2nd meal after <strong>{policy.secondMealAfterHours}h</strong>
            </>
          )}
          · Min <strong>{policy.minDurationMinutes}m</strong> uninterrupted
          {policy.strictLiability && (
            <>
              {' '}
              · Strict liability <strong>on</strong>
            </>
          )}
        </p>
      </div>

      <PolicySection
        title="When is a meal required?"
        description="Required for any work period of 6 hours or more. A second meal is required at 14 hours.">
        <div className="policy-grid">
          <ModusWcNumberInput
            label="First meal after (hours worked)"
            value={String(policy.firstMealAfterHours)}
            min={1}
            max={12}
            onInputChange={(e) => onChange({ firstMealAfterHours: readNumber(e) })}
          />
          <ModusWcNumberInput
            label="Second meal after (hours worked)"
            value={String(policy.secondMealAfterHours)}
            min={0}
            max={24}
            onInputChange={(e) => onChange({ secondMealAfterHours: readNumber(e) })}
          />
        </div>
      </PolicySection>

      <PolicySection
        title="Timing windows"
        description="Meal must start within the allowed window for the shift length.">
        {policy.timingBands.map((band) => (
          <div key={band.id} className="timing-band panel">
            <h3>
              Shift {band.shiftMinHours}h
              {band.shiftMaxHours !== null ? ` – under ${band.shiftMaxHours}h` : '+'}
            </h3>
            <div className="policy-grid">
              <ModusWcNumberInput
                label="Meal must start after hour"
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
                label="Meal must start before hour"
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
            <div className="timeline-preview meal-preview" aria-hidden>
              <span className="timeline-preview-label">Allowed meal window (amber)</span>
              <div className="day-timeline">
                <div className="timeline-seg work" style={{ width: `${(band.mealStartAfterHour / band.mealStartBeforeHour) * 40}%` }} />
                <div
                  className="timeline-seg meal"
                  style={{
                    width: `${((band.mealStartBeforeHour - band.mealStartAfterHour) / band.mealStartBeforeHour) * 50}%`,
                  }}
                />
                <div className="timeline-seg work" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        ))}
      </PolicySection>

      <PolicySection
        title="Duration & relief"
        description="Must be at least 30 minutes, uninterrupted, with the employee relieved of all duties.">
        <div className="policy-grid">
          <ModusWcNumberInput
            label="Minimum duration (minutes)"
            value={String(policy.minDurationMinutes)}
            min={1}
            max={60}
            onInputChange={(e) => onChange({ minDurationMinutes: readNumber(e) })}
          />
          <ModusWcSwitch
            label="Must be uninterrupted"
            value={policy.uninterrupted}
            onInputChange={(e) => onChange({ uninterrupted: readBooleanValue(e) })}
          />
          <ModusWcSwitch
            label="Employee relieved of all duties"
            value={policy.relievedOfDuties}
            onInputChange={(e) => onChange({ relievedOfDuties: readBooleanValue(e) })}
          />
        </div>
      </PolicySection>

      <PolicySection title="Exceptions to 30-minute requirement">
        <div className="exception-list">
          <ModusWcCheckbox
            label="(a) Unforeseeable events (equipment failure, acts of nature)"
            value={policy.exceptions.unforeseeableEvent}
            onInputChange={(e) => setException('unforeseeableEvent', readBooleanValue(e))}
          />
          <ModusWcCheckbox
            label="(b) Industry custom paid meal (20–29 minutes)"
            value={policy.exceptions.industryCustomPaid}
            onInputChange={(e) => setException('industryCustomPaid', readBooleanValue(e))}
          />
          {policy.exceptions.industryCustomPaid && (
            <div className="policy-grid nested">
              <ModusWcNumberInput
                label="Custom min (minutes)"
                value={String(policy.exceptions.industryCustomMinMinutes)}
                min={20}
                max={29}
                onInputChange={(e) =>
                  onChange({
                    exceptions: {
                      ...policy.exceptions,
                      industryCustomMinMinutes: readNumber(e),
                    },
                  })
                }
              />
              <ModusWcNumberInput
                label="Custom max (minutes)"
                value={String(policy.exceptions.industryCustomMaxMinutes)}
                min={20}
                max={29}
                onInputChange={(e) =>
                  onChange({
                    exceptions: {
                      ...policy.exceptions,
                      industryCustomMaxMinutes: readNumber(e),
                    },
                  })
                }
              />
            </div>
          )}
          <ModusWcCheckbox
            label="(c) Undue hardship — BOLI Form WH-161 notice + pay for shortened meal"
            value={policy.exceptions.undueHardshipWh161}
            onInputChange={(e) => setException('undueHardshipWh161', readBooleanValue(e))}
          />
          <ModusWcCheckbox
            label="(d) Tipped food/beverage server waiver (BOLI prescribed form)"
            value={policy.exceptions.tippedServerWaiver}
            onInputChange={(e) => setException('tippedServerWaiver', readBooleanValue(e))}
          />
        </div>
      </PolicySection>

      <PolicySection title="Strict liability & pay">
        <ModusWcSwitch
          label="Strict liability: 1 minute short = no meal taken"
          value={policy.strictLiability}
          onInputChange={(e) => onChange({ strictLiability: readBooleanValue(e) })}
        />
        {policy.strictLiability && (
          <>
            <ModusWcNumberInput
              label="Pay remedy when meal is short (minutes)"
              value={String(policy.strictLiabilityPayMinutes)}
              min={1}
              max={60}
              onInputChange={(e) => onChange({ strictLiabilityPayMinutes: readNumber(e) })}
            />
            <ModusWcAlert
              variant="warning"
              alertTitle="Maza / Pelican Brewing rule"
              alertDescription="If a meal break is even one minute short of 30, the employer must pay for the entire 30 minutes unless a documented exception applies."
            />
          </>
        )}
      </PolicySection>

      <PolicySection
        title="Monitoring"
        description="Employer must monitor that meal breaks are actually taken, not only made available.">
        <div className="policy-grid">
          <ModusWcSwitch
            label="Require proof meals were taken (clock or attestation)"
            value={policy.monitorActualUse}
            onInputChange={(e) => onChange({ monitorActualUse: readBooleanValue(e) })}
          />
          <ModusWcSwitch
            label="Require manager acknowledgment when meal is missed or short"
            value={policy.requireManagerAckOnMiss}
            onInputChange={(e) => onChange({ requireManagerAckOnMiss: readBooleanValue(e) })}
          />
        </div>
      </PolicySection>

      <div className="policy-actions">
        <ModusWcButton color="primary" onButtonClick={onSave}>
          Save policy
        </ModusWcButton>
        <ModusWcButton color="secondary" variant="outlined" onButtonClick={onReset}>
          Reset to Oregon defaults
        </ModusWcButton>
        {saved && <span className="sig-preserved">Policy saved</span>}
      </div>
    </div>
  );
}
