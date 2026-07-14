import { useMemo } from 'react';
import { ModusWcAlert } from '@trimble-oss/moduswebcomponents-react';
import SummaryTiles from '../components/SummaryTiles';
import EmployeeTimesheetCard from '../components/EmployeeTimesheetCard';
import { TIMESHEET_DATE_LABEL, TIMESHEET_EMPLOYEES } from '../data/timesheetMockData';
import { computeTeamRollup } from '../lib/segments';

export default function TimesheetSummary() {
  const rollup = useMemo(() => computeTeamRollup(TIMESHEET_EMPLOYEES), []);

  return (
    <div className="timesheet-summary-page">
      <div className="page-header">
        <h1>Timesheet Summary</h1>
        <p>{TIMESHEET_DATE_LABEL} · Team breaks, meals, and net-to-the-minute work segments</p>
      </div>

      <SummaryTiles rollup={rollup} />

      {rollup.flaggedCount > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <ModusWcAlert
            variant="warning"
            alertTitle={`${rollup.flaggedCount} employee day${rollup.flaggedCount === 1 ? '' : 's'} need review`}
            alertDescription="Expand an employee card to inspect work, rest, and meal segments. Flagged gaps are under the 30-minute threshold or past the meal-compliance window."
          />
        </div>
      )}

      <div className="employee-card-list">
        {TIMESHEET_EMPLOYEES.map((emp) => (
          <EmployeeTimesheetCard key={emp.id} employee={emp} />
        ))}
      </div>
    </div>
  );
}
