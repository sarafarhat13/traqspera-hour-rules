import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import FieldEmployee from './pages/FieldEmployee';
import ForemanDashboard from './pages/ForemanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TimesheetSummary from './pages/TimesheetSummary';
import LaborRulesHub from './pages/LaborRulesHub';
import MealPeriodRules from './pages/MealPeriodRules';
import RestBreakRules from './pages/RestBreakRules';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/field" replace />} />
        <Route path="/field" element={<FieldEmployee />} />
        <Route path="/foreman" element={<ForemanDashboard />} />
        <Route path="/timesheet" element={<TimesheetSummary />} />
        <Route path="/labor-rules" element={<LaborRulesHub />} />
        <Route path="/labor-rules/meals" element={<MealPeriodRules />} />
        <Route path="/labor-rules/rest" element={<RestBreakRules />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/field" replace />} />
      </Route>
    </Routes>
  );
}
