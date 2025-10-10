import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const classes = clsx(
    'fs-button',
    variant === 'secondary' && 'secondary',
    className
  );
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
