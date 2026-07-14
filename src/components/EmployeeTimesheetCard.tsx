import { useMemo, useState } from 'react';
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcTable,
  ModusWcChip,
} from '@trimble-oss/moduswebcomponents-react';
import type { DaySummary, TimesheetEmployee, SegmentType } from '../types';
import {
  formatClockTime,
  segmentTypeLabel,
  timelineParts,
} from '../lib/segments';
import { formatMinutes } from '../lib/timeRules';

interface EmployeeTimesheetCardProps {
  employee: TimesheetEmployee;
}

const COMPLIANCE_CHIP: Record<DaySummary['complianceLevel'], { label: string }> = {
  ok: { label: 'Compliant' },
  warning: { label: 'Approaching' },
  violation: { label: 'Violation' },
};

const TIMELINE_CLASS: Record<SegmentType, string> = {
  work: 'work',
  rest: 'rest',
  meal: 'meal',
  working_lunch: 'working_lunch',
};

function typeCell(_v: unknown, row: unknown): HTMLElement {
  const type = (row as Record<string, unknown>).segmentType as SegmentType;
  const isChild = (row as Record<string, unknown>).isChild as boolean;
  const span = document.createElement('span');
  span.textContent = (isChild ? '↳ ' : '') + segmentTypeLabel(type);
  span.style.cssText = `font-weight:600;${isChild ? 'padding-left:0.5rem;color:#525252;' : ''}`;
  return span;
}

function statusCell(_v: unknown, row: unknown): HTMLElement {
  const status = (row as Record<string, unknown>).status as string;
  const flags = ((row as Record<string, unknown>).flags as string[]) ?? [];
  const span = document.createElement('span');
  if (flags.length > 0 || status === 'flagged') {
    span.textContent = flags[0] ?? 'Flagged';
    span.style.cssText = 'color:#dc2626;font-weight:600;font-size:0.8rem;';
  } else if (status === 'approved') {
    span.textContent = 'OK';
    span.style.cssText = 'color:#16a34a;font-weight:600;';
  } else {
    span.textContent = 'Pending';
    span.style.cssText = 'color:#d97706;font-weight:600;';
  }
  return span;
}

function toTableRows(day: DaySummary) {
  return day.segments.map((seg) => {
    const isWork = seg.type === 'work';
    return {
      id: seg.id,
      segmentType: seg.type,
      isChild: !isWork,
      typeLabel: segmentTypeLabel(seg.type),
      clockIn: formatClockTime(seg.startMs),
      clockOut: formatClockTime(seg.endMs),
      duration: formatMinutes(seg.netMinutes),
      jobPhase: isWork ? `${seg.jobCode ?? '—'} / ${seg.phaseCode ?? '—'}` : '—',
      unionCode: isWork ? (seg.unionCode ?? '—') : '—',
      status: seg.status,
      flags: seg.flags,
    };
  });
}

/** Traqspera-style employee card with day ribbon, timeline, and segment table. */
export default function EmployeeTimesheetCard({ employee }: EmployeeTimesheetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [openDay, setOpenDay] = useState<string | null>(employee.days[0]?.dateKey ?? null);

  const day = employee.days[0];
  const columns = useMemo(
    () => [
      { id: 'type', header: 'Type', accessor: 'typeLabel', cellRenderer: typeCell, width: '140px' },
      { id: 'clockIn', header: 'Start', accessor: 'clockIn', width: '100px' },
      { id: 'clockOut', header: 'End', accessor: 'clockOut', width: '100px' },
      { id: 'duration', header: 'Duration', accessor: 'duration', width: '90px' },
      { id: 'jobPhase', header: 'Job / Phase', accessor: 'jobPhase' },
      { id: 'unionCode', header: 'Union', accessor: 'unionCode', width: '100px' },
      { id: 'status', header: 'Status', accessor: 'status', cellRenderer: statusCell, width: '150px' },
    ],
    []
  );

  if (!day) return null;

  const chip = COMPLIANCE_CHIP[day.complianceLevel];
  const parts = timelineParts(day);

  return (
    <ModusWcCard customClass="employee-timesheet-card" padding="comfortable">
      <div className="employee-card-header">
        <div className="employee-identity">
          <div className="employee-avatar">{employee.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="employee-name">
              {employee.employeeNumber} · {employee.name}
            </div>
            <div className="employee-meta">{employee.craft}</div>
          </div>
        </div>
        <ModusWcButton
          color="secondary"
          variant="outlined"
          size="sm"
          onButtonClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Collapse' : 'Expand entries'}
        </ModusWcButton>
      </div>

      <div className="day-ribbon">
        <span className="day-label">{day.label}</span>
        <ModusWcChip
          label={day.attestationComplete ? 'Attestation complete' : 'Attestation pending'}
        />
        <span className="day-stat">Rest: {formatMinutes(day.restMinutes)}</span>
        <span className="day-stat">Meal: {formatMinutes(day.mealMinutes)}</span>
        <span className="day-stat">Net: {formatMinutes(day.netWorkMinutes)}</span>
        <span className={`compliance-pill ${day.complianceLevel}`}>{chip.label}</span>
      </div>

      <div className="day-timeline" aria-label="Day timeline">
        {parts.map((p, i) => (
          <div
            key={i}
            className={`timeline-seg ${TIMELINE_CLASS[p.type]}${p.flagged ? ' flagged' : ''}`}
            style={{ width: `${p.pct}%` }}
            title={segmentTypeLabel(p.type)}
          />
        ))}
      </div>

      {expanded && (
        <div className="day-segments">
          {employee.days.map((d) => (
            <div key={d.dateKey} className="day-segment-block">
              <button
                type="button"
                className="day-segment-toggle"
                onClick={() => setOpenDay(openDay === d.dateKey ? null : d.dateKey)}
                aria-expanded={openDay === d.dateKey}>
                Timesheet entries — {d.label}
                <span className="day-segment-meta">
                  Break {formatMinutes(d.restMinutes)} · Meal {formatMinutes(d.mealMinutes)}
                </span>
              </button>
              {openDay === d.dateKey && (
                <div className="segment-table-host">
                  <ModusWcTable
                    columns={columns}
                    data={toTableRows(d)}
                    density="comfortable"
                    hover
                    zebra
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ModusWcCard>
  );
}
