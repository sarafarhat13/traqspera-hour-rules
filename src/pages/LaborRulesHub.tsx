import { Link } from 'react-router-dom';
import { ModusWcCard, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';

const RULE_LINKS = [
  {
    path: '/labor-rules/meals',
    title: 'Meal Periods',
    description:
      '6h+ and 14h+ thresholds, timing windows, 30-minute minimum, strict liability, and BOLI exceptions.',
    icon: 'clock',
  },
  {
    path: '/labor-rules/rest',
    title: 'Rest Breaks',
    description:
      '10-minute paid rests per 4 hours worked, placement rules, exceptions, and missed-rest remedies.',
    icon: 'pause',
  },
];

export default function LaborRulesHub() {
  return (
    <div className="labor-rules-page">
      <div className="page-header">
        <h1>Labor Rules</h1>
        <p>
          Configure Oregon meal and rest break policies. Changes apply to compliance evaluation
          across the app.
        </p>
      </div>

      <div className="labor-rules-grid">
        {RULE_LINKS.map((link) => (
          <Link key={link.path} to={link.path} className="labor-rule-link">
            <ModusWcCard padding="comfortable">
              <div className="labor-rule-card">
                <ModusWcIcon name={link.icon} decorative />
                <h2>{link.title}</h2>
                <p>{link.description}</p>
                <span className="labor-rule-cta">Configure →</span>
              </div>
            </ModusWcCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
