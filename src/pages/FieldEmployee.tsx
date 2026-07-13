import { useState } from 'react';
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcSelect,
  ModusWcCheckbox,
  ModusWcTextarea,
  ModusWcAlert,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react';
import Modal from '../components/Modal';
import { useClock } from '../hooks/useClock';
import { useNow } from '../hooks/useNow';
import { readBooleanValue, readStringValue } from '../lib/events';
import {
  CRAFTS,
  REASON_CODES,
  type AttestationState,
  type Craft,
  type ReasonCode,
} from '../types';
import { formatMinutes, SHORT_BREAK_FREEZE_MIN } from '../lib/timeRules';

const craftOptions = CRAFTS.map((c) => ({ label: c, value: c }));

export default function FieldEmployee() {
  const now = useNow(1000);
  const { state, clockIn, clockOut, switchCraft, netMinutes, meal } = useClock('Carpenter');

  // Modal Freeze state.
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [minutesSinceOut, setMinutesSinceOut] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReasonCode | null>(null);

  // Attestation state.
  const [attestation, setAttestation] = useState<AttestationState>({
    tookRestBreaks: false,
    tookMealBreak: false,
    injuryOccurred: false,
    injuryComments: '',
  });
  const [attestationSaved, setAttestationSaved] = useState(false);

  const clockTime = new Date(now).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePunch = () => {
    if (state.isClockedIn) {
      clockOut();
      return;
    }
    const result = clockIn();
    if (!result.accepted && result.requiresReason) {
      setMinutesSinceOut(result.minutesSinceOut);
      setSelectedReason(null);
      setFreezeOpen(true);
    }
  };

  const confirmFreeze = () => {
    if (!selectedReason) return;
    clockIn(selectedReason);
    setFreezeOpen(false);
  };

  const injuryInvalid = attestation.injuryOccurred && attestation.injuryComments.trim() === '';

  const submitAttestation = () => {
    if (injuryInvalid) return;
    setAttestationSaved(true);
  };

  return (
    <div className="field-page">
      <div className="page-header">
        <h1>My Time</h1>
        <p>Clock in and out, switch crafts, and complete your end-of-day attestation.</p>
      </div>

      {/* ---- Clocking ---- */}
      <ModusWcCard padding="comfortable">
        <div className="clock-card">
          <div className={`clock-status ${state.isClockedIn ? 'in' : 'out'}`}>
            <ModusWcIcon name={state.isClockedIn ? 'check_circle' : 'clock'} size="sm" decorative />
            {state.isClockedIn ? `Clocked in · ${state.craft}` : 'Clocked out'}
          </div>
          <div className="big-clock">{clockTime}</div>

          {state.isClockedIn && (
            <p style={{ margin: '0 0 0.5rem', color: 'var(--c-neutral-600)' }}>
              Net worked today: <strong>{formatMinutes(netMinutes)}</strong> (to the minute)
            </p>
          )}

          <div className="clock-button-wrap">
            <ModusWcButton
              color={state.isClockedIn ? 'danger' : 'primary'}
              size="xl"
              fullWidth
              onButtonClick={handlePunch}>
              <ModusWcIcon name={state.isClockedIn ? 'stop_circle' : 'play'} decorative />
              {state.isClockedIn ? 'Clock Out' : 'Clock In'}
            </ModusWcButton>
          </div>

          <div className="craft-row">
            <ModusWcSelect
              label="Switch Craft"
              value={state.craft}
              options={craftOptions}
              onInputChange={(e) => switchCraft(readStringValue(e) as Craft)}
            />
          </div>
          {state.isClockedIn && (
            <p style={{ fontSize: '0.8rem', color: 'var(--c-neutral-500)', marginTop: '0.5rem' }}>
              Changing craft mid-shift splits your time entry to the exact minute.
            </p>
          )}
        </div>
      </ModusWcCard>

      {/* ---- Meal compliance hint ---- */}
      {state.isClockedIn && meal && meal.level !== 'ok' && (
        <div style={{ marginTop: '1rem' }}>
          <ModusWcAlert
            variant={meal.level === 'violation' ? 'error' : meal.level === 'warning' ? 'warning' : 'info'}
            alertTitle={
              meal.level === 'violation'
                ? 'Meal break overdue'
                : meal.level === 'satisfied'
                  ? 'Meal break recorded'
                  : 'Meal break approaching'
            }
            alertDescription={
              meal.level === 'violation'
                ? 'A meal break was required before the end of your 5th hour of work.'
                : meal.level === 'satisfied'
                  ? 'Your meal break is compliant.'
                  : `Take your meal break within ${Math.max(meal.minutesRemaining, 0)} minutes to stay compliant.`
            }
          />
        </div>
      )}

      {/* ---- Attestation ---- */}
      <ModusWcCard customClass="attestation-card" padding="comfortable">
        <div>
          <h2>End-of-Day Attestation</h2>
          <div className="attestation-item">
            <ModusWcCheckbox
              label="I took all of my required rest breaks."
              value={attestation.tookRestBreaks}
              onInputChange={(e) =>
                setAttestation((a) => ({ ...a, tookRestBreaks: readBooleanValue(e) }))
              }
            />
          </div>
          <div className="attestation-item">
            <ModusWcCheckbox
              label="I took my meal break."
              value={attestation.tookMealBreak}
              onInputChange={(e) =>
                setAttestation((a) => ({ ...a, tookMealBreak: readBooleanValue(e) }))
              }
            />
          </div>
          <div className="attestation-item">
            <ModusWcCheckbox
              label="An injury occurred during my shift."
              value={attestation.injuryOccurred}
              onInputChange={(e) =>
                setAttestation((a) => ({
                  ...a,
                  injuryOccurred: readBooleanValue(e),
                  injuryComments: readBooleanValue(e) ? a.injuryComments : '',
                }))
              }
            />
            {attestation.injuryOccurred && (
              <div className="injury-comments">
                <ModusWcTextarea
                  label="Describe the injury (required)"
                  placeholder="Provide details: what happened, body part affected, and any witnesses."
                  required
                  rows={4}
                  value={attestation.injuryComments}
                  feedback={
                    injuryInvalid
                      ? { level: 'error', message: 'Injury details are required.' }
                      : undefined
                  }
                  onInputChange={(e) =>
                    setAttestation((a) => ({ ...a, injuryComments: readStringValue(e) }))
                  }
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ModusWcButton color="primary" disabled={injuryInvalid} onButtonClick={submitAttestation}>
              Submit Attestation
            </ModusWcButton>
            {attestationSaved && (
              <span className="sig-preserved">
                <ModusWcIcon name="check_circle" size="sm" decorative /> Submitted
              </span>
            )}
          </div>
        </div>
      </ModusWcCard>

      {/* ---- Modal Freeze ---- */}
      <Modal
        modalId="freeze-modal"
        isOpen={freezeOpen}
        title="Reason Required"
        backdrop="static"
        showClose={false}
        onClose={() => setFreezeOpen(false)}
        footer={
          <>
            <ModusWcButton color="secondary" variant="outlined" onButtonClick={() => setFreezeOpen(false)}>
              Cancel
            </ModusWcButton>
            <ModusWcButton color="primary" disabled={!selectedReason} onButtonClick={confirmFreeze}>
              Confirm Clock In
            </ModusWcButton>
          </>
        }>
        <p className="freeze-note">
          You are clocking back in after only{' '}
          <strong>{minutesSinceOut ?? 0} minute{(minutesSinceOut ?? 0) === 1 ? '' : 's'}</strong>, which is
          under the {SHORT_BREAK_FREEZE_MIN}-minute threshold. Select a reason code to continue.
        </p>
        <div className="reason-options">
          {REASON_CODES.map((r) => (
            <ModusWcButton
              key={r.value}
              fullWidth
              color={selectedReason === r.value ? 'primary' : 'secondary'}
              variant={selectedReason === r.value ? 'filled' : 'outlined'}
              onButtonClick={() => setSelectedReason(r.value)}>
              {r.label}
            </ModusWcButton>
          ))}
        </div>
      </Modal>
    </div>
  );
}
