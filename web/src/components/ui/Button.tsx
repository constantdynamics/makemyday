import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icons/Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: string;
  iconRight?: string;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" />
      ) : (
        icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={size === 'lg' ? 20 : 18} />}
    </button>
  );
}
