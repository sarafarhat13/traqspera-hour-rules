import { useMemo, useState } from 'react';
import {
  ModusWcTable,
  ModusWcSelect,
  ModusWcButton,
  ModusWcAlert,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react';
import { TIMECARDS } from '../data/mockData';
import type { Timecard } from '../types';
import { readStringValue } from '../lib/events';
import { formatMinutes } from '../lib/timeRules';

const KEEP = '__keep__';

function signatureCell(_v: unknown, row: unknown): HTMLElement {
  const span = document.createElement('span');
  const signedBy = (row as Record<string, unknown>).signedBy as string | null;
  if (signedBy) {
    span.textContent = `Signed · ${signedBy}`;
    span.style.cssText = 'color:#16a34a;font-weight:600;';
  } else {
    span.textContent = 'Unsigned';
    span.style.cssText = 'color:#dc2626;font-weight:600;';
  }
  return span;
}

function flagsCell(_v: unknown, row: unknown): HTMLElement {
  const wrap = document.createElement('div');
  const flags = ((row as Record<string, unknown>).flags as string[]) ?? [];
  if (flags.length === 0) {
    const ok = document.createElement('span');
    ok.textContent = 'Clean';
    ok.style.cssText = 'color:#16a34a;font-weight:600;';
    wrap.appendChild(ok);
    return wrap;
  }
  flags.forEach((f) => {
    const chip = document.createElement('span');
    chip.textContent = f;
    chip.style.cssText =
      'display:inline-block;margin:0 0.25rem 0.25rem 0;padding:0.1rem 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:#fef2f2;color:#dc2626;';
    wrap.appendChild(chip);
  });
  return wrap;
}

export default function AdminDashboard() {
  const [timecards, setTimecards] = useState<Timecard[]>(() =>
    TIMECARDS.map((t) => ({ ...t }))
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newUnion, setNewUnion] = useState<string>(KEEP);
  const [newPhase, setNewPhase] = useState<string>(KEEP);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const flagged = timecards.filter((t) => t.flags.length > 0);
  const clean = timecards.filter((t) => t.flags.length === 0);

  const toRows = (list: Timecard[]) =>
    list.map((t) => ({
      id: t.id,
      employee: t.employee,
      craft: t.craft,
      unionCode: t.unionCode,
      phaseCode: t.phaseCode,
      net: formatMinutes(t.netMinutes),
      signedBy: t.signedBy,
      flags: t.flags,
    }));

  const unionOptions = useMemo(() => {
    const set = new Set(TIMECARDS.map((t) => t.unionCode));
    return [
      { label: '— Keep union code —', value: KEEP },
      ...[...set].sort().map((u) => ({ label: u, value: u })),
    ];
  }, []);

  const phaseOptions = useMemo(() => {
    const set = new Set(TIMECARDS.map((t) => t.phaseCode));
    return [
      { label: '— Keep phase code —', value: KEEP },
      ...[...set].sort().map((p) => ({ label: p, value: p })),
    ];
  }, []);

  const baseColumns = [
    { id: 'employee', header: 'Employee', accessor: 'employee', sortable: true, width: '170px' },
    { id: 'unionCode', header: 'Union', accessor: 'unionCode', sortable: true, width: '110px' },
    { id: 'phaseCode', header: 'Phase', accessor: 'phaseCode', sortable: true, width: '110px' },
    { id: 'net', header: 'Net Hrs', accessor: 'net', sortable: true, width: '90px' },
    { id: 'signature', header: 'Signature', accessor: 'signedBy', cellRenderer: signatureCell, width: '170px' },
  ];

  const flaggedColumns = [
    ...baseColumns,
    { id: 'flags', header: 'Exceptions', accessor: 'flags', cellRenderer: flagsCell },
  ];

  const idsIn = (list: Timecard[]) => new Set(list.map((t) => t.id));

  const handleSelection = (laneList: Timecard[], newLaneIds: string[]) => {
    const laneSet = idsIn(laneList);
    setSelectedIds((prev) => {
      const others = prev.filter((id) => !laneSet.has(id));
      return [...others, ...newLaneIds];
    });
  };

  const readSelectedIds = (e: { detail: unknown }): string[] => {
    const detail = e.detail as {
      selectedRowIds?: string[];
      selectedRows?: Array<{ id: string }>;
    };
    if (detail.selectedRowIds) return detail.selectedRowIds;
    return (detail.selectedRows ?? []).map((r) => r.id);
  };

  const applyBulk = () => {
    if (selectedIds.length === 0) return;
    const selected = new Set(selectedIds);
    let cleared = 0;
    let updated = 0;

    setTimecards((prev) =>
      prev.map((t) => {
        if (!selected.has(t.id)) return t;
        updated += 1;
        const next = { ...t };
        const unionChanged = newUnion !== KEEP && newUnion !== t.unionCode;
        if (newUnion !== KEEP) next.unionCode = newUnion;
        if (newPhase !== KEEP) next.phaseCode = newPhase;
        // Signature logic: only a union-code change invalidates the signature.
        if (unionChanged && next.signature) {
          next.signature = null;
          next.signedBy = null;
          cleared += 1;
        }
        return next;
      })
    );

    setLastResult(
      `Updated ${updated} timecard${updated === 1 ? '' : 's'}. ` +
        (cleared > 0
          ? `${cleared} signature${cleared === 1 ? '' : 's'} cleared due to a union-code change.`
          : 'All digital signatures preserved.')
    );
    setSelectedIds([]);
    setNewUnion(KEEP);
    setNewPhase(KEEP);
  };

  const selectedInFlagged = selectedIds.filter((id) => idsIn(flagged).has(id));
  const selectedInClean = selectedIds.filter((id) => idsIn(clean).has(id));

  return (
    <div>
      <div className="page-header">
        <h1>Management by Exception</h1>
        <p>Review flagged vs. clean timecards, bulk-edit Union/Phase codes, and preserve signatures.</p>
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-bar">
          <span className="selected-count">
            <ModusWcIcon name="check" size="sm" decorative /> {selectedIds.length} selected
          </span>
          <div style={{ minWidth: 200 }}>
            <ModusWcSelect
              label="Set Union Code"
              value={newUnion}
              options={unionOptions}
              onInputChange={(e) => setNewUnion(readStringValue(e))}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <ModusWcSelect
              label="Set Phase Code"
              value={newPhase}
              options={phaseOptions}
              onInputChange={(e) => setNewPhase(readStringValue(e))}
            />
          </div>
          <ModusWcButton
            color="primary"
            disabled={newUnion === KEEP && newPhase === KEEP}
            onButtonClick={applyBulk}>
            Apply to Selected
          </ModusWcButton>
          <ModusWcButton color="secondary" variant="outlined" onButtonClick={() => setSelectedIds([])}>
            Clear
          </ModusWcButton>
        </div>
      )}

      {lastResult && (
        <div style={{ marginBottom: '1rem' }}>
          <ModusWcAlert variant="info" alertTitle="Bulk action complete" alertDescription={lastResult} dismissible />
        </div>
      )}

      <div className="exception-lanes">
        <div className="lane panel">
          <h2>
            <ModusWcIcon name="alert" decorative style={{ color: 'var(--c-error-600)' }} />
            Flagged
            <span className="lane-count">{flagged.length}</span>
          </h2>
          <ModusWcTable
            columns={flaggedColumns}
            data={toRows(flagged)}
            selectable="multi"
            selectedRowIds={selectedInFlagged}
            hover
            sortable
            density="comfortable"
            onRowSelectionChange={(e) => handleSelection(flagged, readSelectedIds(e))}
          />
        </div>

        <div className="lane panel">
          <h2>
            <ModusWcIcon name="check_circle" decorative style={{ color: 'var(--c-success-600)' }} />
            Clean
            <span className="lane-count">{clean.length}</span>
          </h2>
          <ModusWcTable
            columns={baseColumns}
            data={toRows(clean)}
            selectable="multi"
            selectedRowIds={selectedInClean}
            hover
            sortable
            density="comfortable"
            onRowSelectionChange={(e) => handleSelection(clean, readSelectedIds(e))}
          />
        </div>
      </div>
    </div>
  );
}
