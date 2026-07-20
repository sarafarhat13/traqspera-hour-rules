import type { ReactNode } from 'react';

interface HourRulesSectionProps {
  title: string;
  children: ReactNode;
}

/** Traqspera-style section with dark blue header bar. */
export default function HourRulesSection({ title, children }: HourRulesSectionProps) {
  return (
    <section className="hour-rules-section">
      <div className="hour-rules-section-header">{title}</div>
      <div className="hour-rules-section-body">{children}</div>
    </section>
  );
}
