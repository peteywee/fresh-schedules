/**
 * @fileoverview A versatile card component for displaying content in a structured format.
 * It supports a title, description, icon, main content, and a footer.
 */
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Props for the Card component.
 * @property {string} title - The title of the card, displayed in the header.
 * @property {ReactNode} [description] - A description or subtitle, displayed below the title.
 * @property {ReactNode} [children] - The main content of the card.
 * @property {ReactNode} [footer] - The footer content of the card.
 * @property {LucideIcon} [icon] - An optional icon to display in the card's header.
 * @property {boolean} [loading] - If true, sets the `aria-busy` attribute for accessibility.
 */
export type CardProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
};

/**
 * A card component that provides a structured layout for content.
 * It includes a header with an optional icon, title, and description,
 * a main content area, and an optional footer.
 *
 * @param {CardProps} props - The component props.
 * @returns {JSX.Element} The rendered card component.
 */
export function Card({ title, description, children, footer, icon: Icon, loading }: CardProps): JSX.Element {
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
