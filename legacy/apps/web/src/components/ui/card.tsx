import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type CardProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
};

export function Card({ title, description, children, footer, icon: Icon, loading }: CardProps) {
  return (
    <article className="fs-card" aria-busy={loading}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: children ? '1.25rem' : 0 }}>
        {Icon && <Icon size={20} style={{ color: '#38bdf8' }} />}
        <div style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {description && <div style={{ color: '#cbd5f5', fontSize: '0.95rem', lineHeight: 1.6 }}>{description}</div>}
        </div>
      </header>
      {children}
      {footer && <footer>{footer}</footer>}
    </article>
  );
}
