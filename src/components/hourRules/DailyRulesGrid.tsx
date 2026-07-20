import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react';
import type { DailyHourRule } from '../../types/laborRules';
import { readStringValue } from '../../lib/events';

const ROWS: { key: keyof LaborRulesDaily; label: string }[] = [
  { key: 'weekday', label: 'Weekday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'seventhDay', label: '7th Consecutive Day' },
];

type LaborRulesDaily = {
  weekday: DailyHourRule;
  saturday: DailyHourRule;
  sunday: DailyHourRule;
  seventhDay: DailyHourRule;
};

interface DailyRulesGridProps {
  rules: LaborRulesDaily;
  onChange: (key: keyof LaborRulesDaily, field: keyof DailyHourRule, value: string) => void;
}

const COLS: { field: keyof DailyHourRule; header: string }[] = [
  { field: 'totalHours', header: 'Total Hours Allowed' },
  { field: 'regHours', header: 'Reg Hours Allowed' },
  { field: 'otHours', header: 'OT Hours Allowed' },
  { field: 'dtHours', header: 'DT Hours Allowed' },
  { field: 'travelHours', header: 'Travel Hours Allowed' },
];

export default function DailyRulesGrid({ rules, onChange }: DailyRulesGridProps) {
  return (
    <div className="hour-rules-subsection">
      <h3 className="hour-rules-subtitle">Daily Rules</h3>
      <div className="daily-rules-grid">
        <div className="daily-rules-header">
          <span className="day-col">Days</span>
          {COLS.map((c) => (
            <span key={c.field}>{c.header}</span>
          ))}
        </div>
        {ROWS.map((row) => (
          <div key={row.key} className="daily-rules-row">
            <span className="day-col">{row.label}</span>
            {COLS.map((c) => (
              <ModusWcTextInput
                key={c.field}
                aria-label={`${row.label} ${c.header}`}
                value={rules[row.key][c.field]}
                onInputChange={(e) => onChange(row.key, c.field, readStringValue(e))}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
