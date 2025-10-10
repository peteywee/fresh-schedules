import type { ReactNode } from 'react';

export type CardProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function Card({ title, description, children, footer }: CardProps) {
  return (
    <article className="fs-card">
      <header style={{ display: 'grid', gap: '0.5rem', marginBottom: children ? '1.25rem' : 0 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {description && <div style={{ color: '#cbd5f5', fontSize: '0.95rem', lineHeight: 1.6 }}>{description}</div>}
      </header>
      {children}
      {footer && <footer>{footer}</footer>}
    </article>
  );
}
