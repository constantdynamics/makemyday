interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function FireIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C12 2 8 6 8 12C8 15.31 10.69 18 14 18C17.31 18 20 15.31 20 12C20 6 16 2 16 2C16 2 14.5 5.5 12 5.5C12 5.5 12 2 12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19C12 19 9 16 9 13C9 11.34 10.34 10 12 10C13.66 10 15 11.34 15 13C15 16 12 19 12 19Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
