import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';
import type { TeamRollup } from '../types';
import { formatMinutes } from '../lib/timeRules';

interface SummaryTilesProps {
  rollup: TeamRollup;
}

const TILES: {
  key: keyof TeamRollup;
  label: string;
  icon: string;
  format: (v: number) => string;
  accent?: boolean;
  warn?: boolean;
}[] = [
  { key: 'teamMembers', label: 'Team Members', icon: 'person', format: (v) => String(v) },
  {
    key: 'regularMinutes',
    label: 'Regular',
    icon: 'clock',
    format: (v) => formatMinutes(v),
  },
  {
    key: 'overtimeMinutes',
    label: 'Over Time',
    icon: 'clock',
    format: (v) => formatMinutes(v),
  },
  {
    key: 'breakMinutes',
    label: 'Breaks',
    icon: 'pause',
    format: (v) => formatMinutes(v),
    accent: true,
  },
  {
    key: 'mealMinutes',
    label: 'Meals',
    icon: 'clock',
    format: (v) => formatMinutes(v),
    accent: true,
  },
  {
    key: 'totalMinutes',
    label: 'Total Hours',
    icon: 'clock',
    format: (v) => formatMinutes(v),
  },
  {
    key: 'flaggedCount',
    label: 'Flagged Days',
    icon: 'alert',
    format: (v) => String(v),
    warn: true,
  },
];

/** Workyard-style KPI strip for the timesheet summary page. */
export default function SummaryTiles({ rollup }: SummaryTilesProps) {
  return (
    <div className="summary-tiles">
      {TILES.map((tile) => {
        const value = rollup[tile.key];
        return (
          <div
            key={tile.key}
            className={`summary-tile${tile.accent ? ' accent' : ''}${tile.warn && value > 0 ? ' warn' : ''}`}>
            <div className="summary-tile-icon">
              <ModusWcIcon name={tile.icon} decorative />
            </div>
            <div className="summary-tile-body">
              <div className="summary-tile-value">{tile.format(value)}</div>
              <div className="summary-tile-label">{tile.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
