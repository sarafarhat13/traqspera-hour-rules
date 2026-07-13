import type { CrewStatus } from '../types';

export interface HeatZone {
  zone: string;
  total: number;
  dominantStatus: CrewStatus;
  /** True when at least one worker in the zone is at/near a meal violation. */
  hot: boolean;
  hotCount: number;
}

interface HeatMapProps {
  zones: HeatZone[];
  onZoneClick: (zone: string) => void;
}

/**
 * Site heat map. Each cell is a work zone colored by the dominant crew status
 * (green = active, amber = lunch, gray = shift end). A zone with an approaching
 * or active meal violation turns red ("hot") and drills into the list view.
 */
export default function HeatMap({ zones, onZoneClick }: HeatMapProps) {
  return (
    <>
      <div className="heatmap">
        {zones.map((z) => (
          <button
            key={z.zone}
            type="button"
            className={`heat-cell ${z.hot ? 'hot' : z.dominantStatus}`}
            aria-label={`Zone ${z.zone}, ${z.total} workers${z.hot ? `, ${z.hotCount} needing attention` : ''}. Drill down to list.`}
            onClick={() => onZoneClick(z.zone)}>
            <span className="zone">{z.zone}</span>
            <span className="count">
              {z.total} worker{z.total === 1 ? '' : 's'}
              {z.hot ? ` · ${z.hotCount} at risk` : ''}
            </span>
          </button>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--c-success-500)' }} /> Active
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--c-warning-500)' }} /> Lunch
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--c-neutral-400)' }} /> Shift End
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--c-error-500)' }} /> Meal violation risk
        </span>
      </div>
    </>
  );
}
