import { useMemo, useRef, useState } from 'react';
import type { Category } from '../types/db';
import { Icon } from './icons/Icon';

interface Props {
  categories: Category[];
  spinning: boolean;
  onSpinStart: () => void;
  /** Fires when the wheel stops, with the category it landed on. */
  onResult: (category: Category) => void;
  disabled?: boolean;
  label: string;
}

const LIGHTS = 16;

export function SpinWheel({ categories, spinning, onSpinStart, onResult, disabled, label }: Props) {
  const [rotation, setRotation] = useState(0);
  const pendingIndex = useRef<number | null>(null);
  const seg = categories.length ? 360 / categories.length : 0;

  const gradient = useMemo(() => {
    if (!categories.length) return 'var(--surface-2)';
    const stops = categories
      .map((c, i) => `${c.color} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(', ');
    return `conic-gradient(from ${-seg / 2}deg, ${stops})`;
  }, [categories, seg]);

  // Thin light spokes on every segment boundary make the wedges read clearly.
  const spokes = useMemo(() => {
    if (!categories.length) return 'none';
    return `repeating-conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,0.65) 0deg 0.6deg, transparent 0.6deg ${seg}deg)`;
  }, [categories, seg]);

  const handleSpin = () => {
    if (spinning || disabled || !categories.length) return;
    const index = Math.floor(Math.random() * categories.length);
    pendingIndex.current = index;
    const targetCenter = index * seg + seg / 2;
    const desired = (360 - targetCenter) % 360;
    const base = rotation - (rotation % 360) + 360 * 6;
    setRotation(base + desired);
    onSpinStart();
  };

  const handleEnd = () => {
    if (pendingIndex.current == null) return;
    const cat = categories[pendingIndex.current];
    pendingIndex.current = null;
    onResult(cat);
  };

  return (
    <div className={`wheel ${spinning ? 'is-spinning' : ''}`}>
      <span className="wheel__halo" aria-hidden />
      <div className="wheel__rim" aria-hidden>
        {Array.from({ length: LIGHTS }, (_, i) => (
          <span
            key={i}
            className="wheel__light"
            style={
              {
                transform: `rotate(${(i * 360) / LIGHTS}deg) translateY(-138px)`,
                '--i': i,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="wheel__pointer" />
      <button
        className="wheel__disc"
        style={{
          background: gradient,
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={handleSpin}
        onTransitionEnd={handleEnd}
        disabled={spinning || disabled}
        aria-label={label}
      >
        <span className="wheel__spokes" style={{ background: spokes }} aria-hidden />
        {categories.map((c, i) => {
          const angle = i * seg + seg / 2;
          return (
            <span
              key={c.id}
              className="wheel__seg-icon"
              style={{ transform: `rotate(${angle}deg) translateY(-92px) rotate(${-angle}deg)` }}
            >
              <Icon name={c.icon} size={22} color="#fff" />
            </span>
          );
        })}
      </button>
      <span className="wheel__gloss" aria-hidden />
      <button
        className={`wheel__hub ${spinning ? 'is-spinning' : ''}`}
        onClick={handleSpin}
        disabled={spinning || disabled}
        aria-label={label}
      >
        <Icon name="dice" size={30} color="#fff" />
      </button>
    </div>
  );
}
