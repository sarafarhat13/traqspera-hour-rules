import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';
import type { RuleAction } from '../../types/laborRules';

interface RuleActionToggleProps {
  value: RuleAction;
  onChange: (action: RuleAction) => void;
}

/** Flag vs Automatically Apply toggle matching Traqspera Break Rules. */
export default function RuleActionToggle({ value, onChange }: RuleActionToggleProps) {
  return (
    <div className="rule-action-toggle" role="group" aria-label="Rule action">
      <button
        type="button"
        className={`rule-action-btn flag${value === 'flag' ? ' active' : ''}`}
        onClick={() => onChange('flag')}>
        <ModusWcIcon name="flag" size="sm" decorative />
        Flag
      </button>
      <button
        type="button"
        className={`rule-action-btn apply${value === 'auto_apply' ? ' active' : ''}`}
        onClick={() => onChange('auto_apply')}>
        <ModusWcIcon name="edit" size="sm" decorative />
        Automatically Apply
      </button>
    </div>
  );
}
