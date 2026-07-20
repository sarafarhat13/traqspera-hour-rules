import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react';
import RuleActionToggle from './RuleActionToggle';
import type { RuleAction } from '../../types/laborRules';
import { readStringValue } from '../../lib/events';

interface BreakRulesRowProps {
  description: string;
  minimumHours: number;
  breakLengthHours: number;
  action: RuleAction;
  onMinimumHoursChange: (v: number) => void;
  onBreakLengthChange: (v: number) => void;
  onActionChange: (a: RuleAction) => void;
}

function readHours(e: { target: EventTarget | null }): number {
  const n = Number(readStringValue(e));
  return Number.isFinite(n) ? n : 0;
}

/** Traqspera Break Rules row: min hours, break length, Flag / Automatically Apply. */
export default function BreakRulesRow({
  description,
  minimumHours,
  breakLengthHours,
  action,
  onMinimumHoursChange,
  onBreakLengthChange,
  onActionChange,
}: BreakRulesRowProps) {
  return (
    <div className="break-rules-block">
      <p className="break-rules-desc">{description}</p>
      <div className="break-rules-row">
        <ModusWcTextInput
          label="Minimum Hours Per Day"
          value={String(minimumHours)}
          onInputChange={(e) => onMinimumHoursChange(readHours(e))}
        />
        <ModusWcTextInput
          label="Break Length Required (hours)"
          value={String(breakLengthHours)}
          onInputChange={(e) => onBreakLengthChange(readHours(e))}
        />
        <div className="break-rules-action">
          <span className="field-label">Action</span>
          <RuleActionToggle value={action} onChange={onActionChange} />
        </div>
      </div>
    </div>
  );
}
