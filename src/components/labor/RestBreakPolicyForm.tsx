import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcNumberInput,
  ModusWcSelect,
  ModusWcSwitch,
} from '@trimble-oss/moduswebcomponents-react';
import PolicySection from './PolicySection';
import type { RestBreakPolicy } from '../../types/laborRules';
import { readBooleanValue, readStringValue } from '../../lib/events';

function readNumber(e: { target: EventTarget | null }): number {
  const raw = readStringValue(e);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

interface RestBreakPolicyFormProps {
  policy: RestBreakPolicy;
  onChange: (patch: Partial<RestBreakPolicy>) => void;
  onSave: () => void;
  onReset: () => void;
  saved: boolean;
}

const PLACEMENT_OPTIONS = [
  { label: 'Distribute evenly across each work block', value: 'distribute' },
  { label: 'Fixed intervals', value: 'fixed' },
  { label: 'Manager discretion within block', value: 'manager' },
];

export default function RestBreakPolicyForm({
  policy,
  onChange,
  onSave,
  onReset,
  saved,
}: RestBreakPolicyFormProps) {
  const setException = (key: keyof RestBreakPolicy['exceptions'], value: boolean) => {
    onChange({ exceptions: { ...policy.exceptions, [key]: value } });
  };

  return (
    <div className="labor-rules-page">
      <div className="policy-summary panel">
        <h2>{policy.name}</h2>
        <p>
          <strong>{policy.minutesPerBreak} min</strong> paid rest per{' '}
          <strong>{policy.accrualHours}h</strong> worked
          {policy.majorFractionEnabled && (
            <> (major fraction &gt; {policy.majorFractionHours}h)</>
          )}
          · Monitor actual use: <strong>{policy.monitorActualUse ? 'On' : 'Off'}</strong>
        </p>
      </div>

      <PolicySection
        title="When is a rest break required?"
        description="Oregon requires one paid 10-minute rest period for each 4 hours of work time, or major fraction thereof.">
        <div className="policy-grid">
          <ModusWcNumberInput
            label="Minutes per rest break"
            value={String(policy.minutesPerBreak)}
            min={1}
            max={60}
            onInputChange={(e) => onChange({ minutesPerBreak: readNumber(e) })}
          />
          <ModusWcNumberInput
            label="Accrual block (hours worked)"
            value={String(policy.accrualHours)}
            min={1}
            max={12}
            onInputChange={(e) => onChange({ accrualHours: readNumber(e) })}
          />
        </div>
        <div className="policy-toggle-row">
          <ModusWcSwitch
            label="Apply major-fraction rule"
            value={policy.majorFractionEnabled}
            onInputChange={(e) => onChange({ majorFractionEnabled: readBooleanValue(e) })}
          />
          {policy.majorFractionEnabled && (
            <ModusWcNumberInput
              label="Major fraction threshold (hours)"
              value={String(policy.majorFractionHours)}
              min={1}
              max={policy.accrualHours}
              onInputChange={(e) => onChange({ majorFractionHours: readNumber(e) })}
            />
          )}
        </div>
      </PolicySection>

      <PolicySection
        title="Timing & placement"
        description="Rest breaks are distributed through the shift. They must not overlap unpaid meal periods.">
        <ModusWcSelect
          label="Placement strategy"
          value={policy.placement}
          options={PLACEMENT_OPTIONS}
          onInputChange={(e) =>
            onChange({ placement: readStringValue(e) as RestBreakPolicy['placement'] })
          }
        />
        <div className="policy-grid">
          <ModusWcNumberInput
            label="Minimum gap between rests (minutes)"
            value={String(policy.minGapBetweenRestsMinutes)}
            min={0}
            max={240}
            onInputChange={(e) => onChange({ minGapBetweenRestsMinutes: readNumber(e) })}
          />
          <ModusWcSwitch
            label="Rest cannot overlap meal period"
            value={policy.cannotOverlapMeal}
            onInputChange={(e) => onChange({ cannotOverlapMeal: readBooleanValue(e) })}
          />
        </div>
        <div className="timeline-preview rest-preview" aria-hidden>
          <span className="timeline-preview-label">4h block preview</span>
          <div className="day-timeline">
            <div className="timeline-seg work" style={{ width: '70%' }} />
            <div className="timeline-seg rest" style={{ width: '8%' }} title="Rest" />
            <div className="timeline-seg work" style={{ width: '22%' }} />
          </div>
        </div>
      </PolicySection>

      <PolicySection
        title="Duration & pay"
        description="Rest breaks are paid time. Durations are net-to-the-minute.">
        <div className="policy-grid">
          <ModusWcNumberInput
            label="Minimum duration (minutes)"
            value={String(policy.minDurationMinutes)}
            min={1}
            max={30}
            onInputChange={(e) => onChange({ minDurationMinutes: readNumber(e) })}
          />
          <ModusWcSwitch
            label="Paid rest break"
            value={policy.paid}
            onInputChange={(e) => onChange({ paid: readBooleanValue(e) })}
          />
          <ModusWcSwitch
            label="Must be uninterrupted"
            value={policy.uninterrupted}
            onInputChange={(e) => onChange({ uninterrupted: readBooleanValue(e) })}
          />
        </div>
      </PolicySection>

      <PolicySection
        title="Exceptions"
        description="Enable only the exception paths your organization uses.">
        <div className="exception-list">
          <ModusWcCheckbox
            label="Unforeseeable event (equipment failure, acts of nature)"
            value={policy.exceptions.unforeseeableEvent}
            onInputChange={(e) => setException('unforeseeableEvent', readBooleanValue(e))}
          />
          <ModusWcCheckbox
            label="Solo worker / no relief available"
            value={policy.exceptions.soloNoRelief}
            onInputChange={(e) => setException('soloNoRelief', readBooleanValue(e))}
          />
          <ModusWcCheckbox
            label="Union CBA alternate schedule"
            value={policy.exceptions.unionCba}
            onInputChange={(e) => setException('unionCba', readBooleanValue(e))}
          />
          <ModusWcCheckbox
            label="Voluntary skip (employee acknowledgment required)"
            value={policy.exceptions.voluntarySkip}
            onInputChange={(e) => setException('voluntarySkip', readBooleanValue(e))}
          />
        </div>
      </PolicySection>

      <PolicySection title="Enforcement & remedies">
        <div className="policy-grid">
          <ModusWcSwitch
            label="Treat breaks under minimum duration as missed"
            value={policy.enforcement.treatUnderMinAsMissed}
            onInputChange={(e) =>
              onChange({
                enforcement: {
                  ...policy.enforcement,
                  treatUnderMinAsMissed: readBooleanValue(e),
                },
              })
            }
          />
          <ModusWcNumberInput
            label="Missed-rest premium (minutes of pay)"
            value={String(policy.enforcement.missedRestPremiumMinutes)}
            min={0}
            max={120}
            onInputChange={(e) =>
              onChange({
                enforcement: {
                  ...policy.enforcement,
                  missedRestPremiumMinutes: readNumber(e),
                },
              })
            }
          />
        </div>
      </PolicySection>

      <PolicySection
        title="Monitoring"
        description="Employers must monitor that breaks are actually taken, not only made available.">
        <div className="policy-grid">
          <ModusWcSwitch
            label="Require proof breaks were taken (clock or attestation)"
            value={policy.monitorActualUse}
            onInputChange={(e) => onChange({ monitorActualUse: readBooleanValue(e) })}
          />
          <ModusWcSwitch
            label="Require manager acknowledgment when rest is missed"
            value={policy.requireManagerAckOnMiss}
            onInputChange={(e) => onChange({ requireManagerAckOnMiss: readBooleanValue(e) })}
          />
        </div>
        <ModusWcAlert
          variant="info"
          alertTitle="Net-to-the-minute"
          alertDescription="Rest durations are calculated as the exact whole-minute difference between punch times. Nothing is rounded to the nearest quarter hour."
        />
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
