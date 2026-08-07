/**
 * The wheel — the classic, redrawn.
 *
 * Geometry note: the disc's conic gradient starts at `-SEG/2`, so segment *i*
 * spans `[i·SEG − SEG/2, i·SEG + SEG/2]` and is therefore **centred on i·SEG**.
 * Labels and the landing angle must use `i·SEG` too — the previous version added
 * a half-segment to both, which parked the pointer on the seam between two
 * wedges instead of the middle of the winning one.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Icon } from '../../../components/icons/Icon';
import type { Category } from '../../../types/db';
import type { MechanicProps } from '../types';

interface Props extends MechanicProps {
  categories: Category[];
  loading?: boolean;
}

const LAMPS = 16;
const SPIN_MS = 5000;
/** Round off with a timer: `transitionend` never fires in a background tab. */
const SETTLE_MS = SPIN_MS + 50;
const REDUCED_MS = 180;

/** Wheel wedges sit deeper than the token accents so white labels stay legible. */
function deepen(color: string): string {
  return `color-mix(in srgb, ${color} 80%, #0d0a18)`;
}

export function WheelMechanic({
  phase,
  api,
  onStart,
  onSettled,
  reducedMotion,
  categories,
  loading,
}: Props) {
  const { t, lang } = useI18n();
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const seg = categories.length ? 360 / categories.length : 0;
  const spinning = phase === 'running';
  const duration = reducedMotion ? REDUCED_MS : SPIN_MS;
  const ease = `transform ${duration}ms cubic-bezier(.12,.76,.14,1)`;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // A fresh round clears the winner highlight.
  useEffect(() => {
    if (phase === 'idle') setLanded(null);
  }, [phase]);

  // Above ten categories the labels stop being readable — show icons only.
  const labelled = categories.length <= 10;

  const wedges = useMemo(() => {
    if (!categories.length) return 'var(--surface-2)';
    const stops = categories
      .map((c, i) => `${deepen(c.color)} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(', ');
    return `conic-gradient(from ${-seg / 2}deg, ${stops})`;
  }, [categories, seg]);

  const spin = useCallback(() => {
    if (spinning || !categories.length) return;
    const index = Math.floor(Math.random() * categories.length);
    // Draw first so the wheel knows where it has to stop; the result stays
    // hidden until the spin settles.
    const drawn = api.drawPick(categories[index]);
    if (!drawn) return;

    const desired = (360 - index * seg) % 360;
    const base = rotation - (rotation % 360) + 360 * 6;
    setLanded(null);
    setRotation(base + desired);
    onStart(drawn);

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setLanded(index);
        onSettled();
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [api, categories, onSettled, onStart, reducedMotion, rotation, seg, spinning]);

  /** Short wheel label, falling back to the first word of the category name. */
  const shortName = (cat: Category): string => {
    const key = `wheel.short.${cat.id}`;
    const short = t(key);
    if (short !== key) return short;
    return categoryName(cat, lang).split(/[\s&]+/)[0];
  };

  if (loading) return <div className="wheel wheel--skeleton" />;

  return (
    <div className={`wheel ${spinning ? 'is-spinning' : ''}`}>
      <span className="wheel__halo" aria-hidden />

      <div className="wheel__bezel" aria-hidden>
        {Array.from({ length: LAMPS }, (_, i) => (
          <span
            key={i}
            className="wheel__lamp"
            style={{
              transform: `rotate(${(i * 360) / LAMPS}deg) translateY(-138px)`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>

      <div className="wheel__pointer" aria-hidden>
        <span className="wheel__pointer-ball" />
        <span className="wheel__pointer-tip" />
      </div>

      <button
        className="wheel__disc"
        style={{ background: wedges, transform: `rotate(${rotation}deg)`, transition: ease }}
        onClick={spin}
        disabled={spinning || !categories.length}
        aria-label={t('dashboard.spinTitle')}
      >
        <span
          className="wheel__spokes"
          aria-hidden
          style={{
            background: `repeating-conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,.5) 0deg .5deg, transparent .5deg ${seg}deg)`,
          }}
        />
        <span
          className="wheel__winner"
          aria-hidden
          style={{
            background: `conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,.28) 0deg ${seg}deg, transparent ${seg}deg)`,
            transform: `rotate(${(landed ?? 0) * seg}deg)`,
            opacity: !spinning && landed != null ? 1 : 0,
          }}
        />
        <span className="wheel__gloss" aria-hidden />
      </button>

      {/* Gyroscope: the layer turns +R, each label turns −R, so text stays upright. */}
      <span
        className="wheel__labels"
        aria-hidden
        style={{ transform: `rotate(${rotation}deg)`, transition: ease }}
      >
        {categories.map((c, i) => (
          <span
            key={c.id}
            className="wheel__label"
            style={{
              transform: `rotate(${i * seg}deg) translateY(-88px) rotate(${-(i * seg) - rotation}deg)`,
              transition: ease,
            }}
          >
            <Icon name={c.icon} size={19} color="#fff" />
            {labelled && <span className="wheel__label-text">{shortName(c)}</span>}
          </span>
        ))}
      </span>

      <button
        className={`wheel__hub ${spinning ? 'is-spinning' : ''}`}
        onClick={spin}
        disabled={spinning || !categories.length}
        aria-label={t('dashboard.spinTitle')}
      >
        <span className="wheel__hub-icon">
          <Icon name="compass" size={22} color="#fff" />
        </span>
        <span className="wheel__hub-text">{spinning ? t('wheel.spinning') : t('wheel.spin')}</span>
      </button>
    </div>
  );
}
