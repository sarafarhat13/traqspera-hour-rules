import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import FieldEmployee from './pages/FieldEmployee';
import ForemanDashboard from './pages/ForemanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TimesheetSummary from './pages/TimesheetSummary';
import TimesheetHourRules from './pages/TimesheetHourRules';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/field" replace />} />
        <Route path="/field" element={<FieldEmployee />} />
        <Route path="/foreman" element={<ForemanDashboard />} />
        <Route path="/timesheet" element={<TimesheetSummary />} />
        <Route path="/labor-rules" element={<TimesheetHourRules />} />
        <Route path="/labor-rules/*" element={<Navigate to="/labor-rules" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/field" replace />} />
      </Route>
    </Routes>
  );
}
