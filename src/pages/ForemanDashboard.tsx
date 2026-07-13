import { useMemo, useState } from 'react';
import {
  ModusWcButton,
  ModusWcTable,
  ModusWcAlert,
  ModusWcChip,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react';
import HeatMap, { type HeatZone } from '../components/HeatMap';
import { useNow } from '../hooks/useNow';
import { CREW } from '../data/mockData';
import type { CrewStatus } from '../types';
import { evaluateMealCompliance, formatCountdown, type MealComplianceLevel } from '../lib/timeRules';

type View = 'list' | 'heatmap';

const STATUS_META: Record<CrewStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#16a34a' },
  lunch: { label: 'Lunch', color: '#d97706' },
  shift_end: { label: 'Shift End', color: '#737373' },
};

const LEVEL_COLOR: Record<MealComplianceLevel, { bg: string; fg: string }> = {
  ok: { bg: '#f0fdf4', fg: '#16a34a' },
  warning: { bg: '#fffbeb', fg: '#d97706' },
  violation: { bg: '#fef2f2', fg: '#dc2626' },
  satisfied: { bg: '#f0f9ff', fg: '#0369a1' },
};

function pill(text: string, bg: string, fg: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = text;
  span.style.cssText = `display:inline-block;padding:0.15rem 0.6rem;border-radius:9999px;font-size:0.8rem;font-weight:600;background:${bg};color:${fg};`;
  return span;
}

export default function ForemanDashboard() {
  const now = useNow(15_000);
  const [view, setView] = useState<View>('list');
  const [zoneFilter, setZoneFilter] = useState<string | null>(null);

  // Enrich crew with live, net-to-the-minute meal compliance.
  const rows = useMemo(() => {
    return CREW.map((c) => {
      const meal = evaluateMealCompliance(c.clockInAt, now, c.lastMealAt);
      const countdown =
        c.status === 'shift_end'
          ? '—'
          : meal.level === 'satisfied'
            ? 'Met'
            : formatCountdown(meal.minutesRemaining);
      return {
        id: c.id,
        name: c.name,
        craft: c.craft,
        status: c.status,
        statusLabel: STATUS_META[c.status].label,
        countdown,
        level: meal.level,
        zone: c.zone,
        _meal: meal,
      };
    });
  }, [now]);

  const atRisk = rows.filter(
    (r) => r.status !== 'shift_end' && (r.level === 'warning' || r.level === 'violation')
  );

  const zones: HeatZone[] = useMemo(() => {
    const map = new Map<string, typeof rows>();
    rows.forEach((r) => {
      const key = r.zone[0]; // group by zone column letter (A/B/C)
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([zone, list]) => {
        const hotCount = list.filter(
          (r) => r.status !== 'shift_end' && (r.level === 'warning' || r.level === 'violation')
        ).length;
        // Dominant status = most common status in the zone.
        const counts: Record<CrewStatus, number> = { active: 0, lunch: 0, shift_end: 0 };
        list.forEach((r) => (counts[r.status] += 1));
        const dominantStatus = (Object.keys(counts) as CrewStatus[]).reduce((a, b) =>
          counts[a] >= counts[b] ? a : b
        );
        return { zone, total: list.length, dominantStatus, hot: hotCount > 0, hotCount };
      });
  }, [rows]);

  const visibleRows = zoneFilter ? rows.filter((r) => r.zone.startsWith(zoneFilter)) : rows;

  const columns = useMemo(
    () => [
      { id: 'name', header: 'Crew Member', accessor: 'name', sortable: true, width: '200px' },
      { id: 'craft', header: 'Craft', accessor: 'craft', sortable: true },
      {
        id: 'status',
        header: 'Status',
        accessor: 'statusLabel',
        sortable: true,
        cellRenderer: (_v: unknown, row: unknown) => {
          const s = (row as Record<string, unknown>).status as CrewStatus;
          return pill(STATUS_META[s].label, '#f5f5f5', STATUS_META[s].color);
        },
      },
      {
        id: 'countdown',
        header: 'Meal Compliance',
        accessor: 'countdown',
        sortable: false,
        cellRenderer: (value: unknown, row: unknown) => {
          const r = row as Record<string, unknown>;
          const lvl = r.level as MealComplianceLevel;
          if (r.status === 'shift_end') return pill('—', '#f5f5f5', '#737373');
          const c = LEVEL_COLOR[lvl];
          return pill(String(value), c.bg, c.fg);
        },
      },
      { id: 'zone', header: 'Zone', accessor: 'zone', sortable: true, width: '90px' },
    ],
    []
  );

  const drillDown = (zone: string) => {
    setZoneFilter(zone);
    setView('list');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Foreman Dashboard</h1>
        <p>Live crew status and net-to-the-minute meal-break compliance countdowns.</p>
      </div>

      <div className="stat-row" style={{ marginBottom: '1.25rem' }}>
        <div className="stat">
          <div className="label">Active</div>
          <div className="value">{rows.filter((r) => r.status === 'active').length}</div>
        </div>
        <div className="stat">
          <div className="label">On Lunch</div>
          <div className="value">{rows.filter((r) => r.status === 'lunch').length}</div>
        </div>
        <div className="stat">
          <div className="label">At Risk</div>
          <div className="value" style={{ color: 'var(--c-warning-600)' }}>
            {atRisk.filter((r) => r.level === 'warning').length}
          </div>
        </div>
        <div className="stat">
          <div className="label">In Violation</div>
          <div className="value" style={{ color: 'var(--c-error-600)' }}>
            {atRisk.filter((r) => r.level === 'violation').length}
          </div>
        </div>
      </div>

      {atRisk.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <ModusWcAlert
            variant={atRisk.some((r) => r.level === 'violation') ? 'error' : 'warning'}
            alertTitle={`${atRisk.length} crew member${atRisk.length === 1 ? '' : 's'} need attention`}
            alertDescription={`Approaching or past the 5-hour meal-break threshold: ${atRisk
              .map((r) => r.name)
              .join(', ')}.`}
          />
        </div>
      )}

      <div className="panel">
        <div className="toolbar">
          <div className="toggles" role="group" aria-label="View toggle">
            <ModusWcButton
              color={view === 'list' ? 'primary' : 'secondary'}
              variant={view === 'list' ? 'filled' : 'outlined'}
              onButtonClick={() => setView('list')}>
              <ModusWcIcon name="list_bulleted" decorative /> List
            </ModusWcButton>
            <ModusWcButton
              color={view === 'heatmap' ? 'primary' : 'secondary'}
              variant={view === 'heatmap' ? 'filled' : 'outlined'}
              onButtonClick={() => setView('heatmap')}>
              <ModusWcIcon name="map" decorative /> Heat Map
            </ModusWcButton>
          </div>
          {zoneFilter && (
            <ModusWcChip
              label={`Zone ${zoneFilter} · ${visibleRows.length}`}
              showRemove
              onChipRemove={() => setZoneFilter(null)}
            />
          )}
        </div>

        {view === 'list' ? (
          <ModusWcTable columns={columns} data={visibleRows} sortable hover density="comfortable" />
        ) : (
          <HeatMap zones={zones} onZoneClick={drillDown} />
        )}
      </div>
    </div>
  );
}
