interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function PaletteIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
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
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.93 0 1.67-.67 1.67-1.67 0-.44-.15-.84-.4-1.15-.25-.31-.38-.73-.38-1.18 0-.93.67-1.67 1.67-1.67h1.95C19.16 18.33 22 15.49 22 12 22 6.48 17.52 2 12 2zM7 13c-.83 0-1.5-.67-1.5-1.5S6.17 10 7 10s1.5.67 1.5 1.5S7.83 13 7 13zm3-4c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 9 10 9zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 9 14 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.17 10 17 10s1.5.67 1.5 1.5S17.83 13 17 13z"
        fill={color}
      />
    </svg>
  );
}
