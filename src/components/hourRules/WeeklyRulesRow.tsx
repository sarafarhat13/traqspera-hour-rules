import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react';
import type { WeeklyHourRule } from '../../types/laborRules';
import { readStringValue } from '../../lib/events';

interface WeeklyRulesRowProps {
  rules: WeeklyHourRule;
  onChange: (field: keyof WeeklyHourRule, value: string) => void;
}

const FIELDS: { field: keyof WeeklyHourRule; label: string }[] = [
  { field: 'totalHours', label: 'Total Hours Per Week' },
  { field: 'regHours', label: 'Reg Hours Per Week' },
  { field: 'otHours', label: 'OT Hours Per Week' },
  { field: 'dtHours', label: 'DT Hours Per Week' },
  { field: 'travelHours', label: 'Travel Hours Per Week' },
];

export default function WeeklyRulesRow({ rules, onChange }: WeeklyRulesRowProps) {
  return (
    <div className="hour-rules-subsection">
      <h3 className="hour-rules-subtitle">Weekly Rules</h3>
      <div className="weekly-rules-row">
        {FIELDS.map((f) => (
          <ModusWcTextInput
            key={f.field}
            label={f.label}
            value={rules[f.field]}
            onInputChange={(e) => onChange(f.field, readStringValue(e))}
          />
        ))}
      </div>
    </div>
  );
}
