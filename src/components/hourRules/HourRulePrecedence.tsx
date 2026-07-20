import type { PrecedenceLevel } from '../../types/laborRules';

const LABELS: Record<PrecedenceLevel, string> = {
  company: 'Company',
  union: 'Union',
  state: 'State',
};

interface HourRulePrecedenceProps {
  order: PrecedenceLevel[];
  custom: boolean;
  onCustomChange: (v: boolean) => void;
}

export default function HourRulePrecedence({ order, custom, onCustomChange }: HourRulePrecedenceProps) {
  return (
    <div className="hour-rules-subsection precedence-block">
      <label className="precedence-check">
        <input
          type="checkbox"
          checked={custom}
          onChange={(e) => onCustomChange(e.target.checked)}
        />
        Use custom order when applying rules (if not, will look for the lowest allowed per hour
        type that applies).
      </label>
      <h3 className="hour-rules-subtitle">Hour Rule Precedence</h3>
      <ol className={`precedence-list${custom ? '' : ' disabled'}`}>
        {order.map((level) => (
          <li key={level}>{LABELS[level]}</li>
        ))}
      </ol>
    </div>
  );
}
