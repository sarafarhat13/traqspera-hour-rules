import { Link } from 'react-router-dom';
import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';
import MealPeriodPolicyForm from '../components/labor/MealPeriodPolicyForm';
import { useLaborRules } from '../hooks/useLaborRules';

export default function MealPeriodRules() {
  const { rules, updateMeal, save, saved, reset } = useLaborRules();

  return (
    <div className="labor-rules-page">
      <Link to="/labor-rules" className="labor-rules-back">
        <ModusWcIcon name="arrow_back" size="sm" decorative /> Labor Rules
      </Link>
      <div className="page-header">
        <h1>Meal Periods</h1>
        <p>30-minute unpaid meal periods, timing windows, and strict-liability pay rules.</p>
      </div>
      <MealPeriodPolicyForm
        policy={rules.mealPeriod}
        onChange={updateMeal}
        onSave={save}
        onReset={reset}
        saved={saved}
      />
    </div>
  );
}
