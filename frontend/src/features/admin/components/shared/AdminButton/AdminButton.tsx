import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './AdminButton.css';

export type AdminButtonVariant = 'solid' | 'outline' | 'ghost';

type AdminButtonProps = {
  variant?: AdminButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export const AdminButton = ({
  variant = 'solid',
  icon,
  loading,
  className = '',
  children,
  type = 'button',
  ...rest
}: AdminButtonProps) => (
  <button
    type={type}
    className={`admin-button admin-button--${variant} ${className}`.trim()}
    disabled={loading || rest.disabled}
    {...rest}
  >
    {icon ? <span className="admin-button__icon">{icon}</span> : null}
    <span className="admin-button__label">{children}</span>
  </button>
);
