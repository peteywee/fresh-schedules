import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
};

export function Button({ variant = 'primary', className, children, icon: Icon, iconPosition = 'left', ...props }: ButtonProps) {
  const classes = clsx(
    'fs-button',
    variant === 'secondary' && 'secondary',
    className
  );
  return (
    <button className={classes} {...props}>
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
}
