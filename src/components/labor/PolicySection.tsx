import type { ReactNode } from 'react';

interface PolicySectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function PolicySection({ title, description, children }: PolicySectionProps) {
  return (
    <section className="policy-section panel">
      <h2>{title}</h2>
      {description && <p className="policy-section-desc">{description}</p>}
      {children}
    </section>
  );
}
