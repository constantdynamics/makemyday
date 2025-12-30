interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ShareIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={color} strokeWidth="2" />
    </svg>
  );
}
