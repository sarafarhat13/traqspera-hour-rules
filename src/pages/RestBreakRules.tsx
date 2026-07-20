import { Link } from 'react-router-dom';
import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';
import RestBreakPolicyForm from '../components/labor/RestBreakPolicyForm';
import { useLaborRules } from '../hooks/useLaborRules';

export default function RestBreakRules() {
  const { rules, updateRest, save, saved, reset } = useLaborRules();

  return (
    <div className="labor-rules-page">
      <Link to="/labor-rules" className="labor-rules-back">
        <ModusWcIcon name="arrow_back" size="sm" decorative /> Labor Rules
      </Link>
      <div className="page-header">
        <h1>Rest Breaks</h1>
        <p>Paid 10-minute rest periods per 4 hours of work time (Oregon default).</p>
      </div>
      <RestBreakPolicyForm
        policy={rules.restBreak}
        onChange={updateRest}
        onSave={save}
        onReset={reset}
        saved={saved}
      />
    </div>
  );
}
