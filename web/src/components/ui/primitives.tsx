import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icons/Icon';

/* ---- Card ---- */
export function Card({
  className = '',
  interactive,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div className={`card ${interactive ? 'card--interactive' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ---- Badge ---- */
export function Badge({
  children,
  color,
  tone = 'soft',
}: {
  children: ReactNode;
  color?: string;
  tone?: 'soft' | 'solid';
}) {
  const style = color
    ? tone === 'solid'
      ? { background: color, color: '#fff' }
      : { background: `${color}22`, color }
    : undefined;
  return (
    <span className={`badge badge--${tone}`} style={style}>
      {children}
    </span>
  );
}

/* ---- Avatar ---- */
export function Avatar({ emoji, size = 44 }: { emoji: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {emoji}
    </span>
  );
}

/* ---- ProgressBar ---- */
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress">
      <div
        className="progress__fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

/* ---- Spinner ---- */
export function Spinner({ size = 28 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="loading" />;
}

/* ---- Skeleton ---- */
export function Skeleton({ height = 16, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  return <span className="skeleton" style={{ height, width, borderRadius: radius }} />;
}

/* ---- EmptyState ---- */
export function EmptyState({
  icon = 'compass',
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

/* ---- SegmentedControl ---- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: string }[];
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className={`segmented__item ${o.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
