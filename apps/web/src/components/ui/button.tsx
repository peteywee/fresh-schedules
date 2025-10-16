/**
 * @fileoverview A customizable button component with support for variants, icons, and standard button attributes.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

/**
 * Defines the visual style of the button.
 * @property {'primary'} primary - The main button style for primary actions.
 * @property {'secondary'} secondary - The secondary button style for less prominent actions.
 */
export type ButtonVariant = 'primary' | 'secondary';

/**
 * Props for the Button component.
 * Extends standard HTML button attributes.
 * @property {ButtonVariant} [variant='primary'] - The visual variant of the button.
 * @property {LucideIcon} [icon] - An optional icon to display within the button.
 * @property {'left' | 'right'} [iconPosition='left'] - The position of the icon relative to the button text.
 */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
};

/**
 * A versatile button component that can be customized with different styles and an optional icon.
 * It combines base styles with variant-specific styles and any additional classes provided.
 *
 * @param {ButtonProps} props - The component props.
 * @param {ButtonVariant} [props.variant='primary'] - The button's visual style.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 * @param {ReactNode} props.children - The content to be displayed inside the button.
 * @param {LucideIcon} [props.icon] - The icon to be displayed.
 * @param {'left' | 'right'} [props.iconPosition='left'] - The position of the icon.
 * @returns {JSX.Element} The rendered button element.
 */
export function Button({ variant = 'primary', className, children, icon: Icon, iconPosition = 'left', ...props }: ButtonProps): React.ReactElement {
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
