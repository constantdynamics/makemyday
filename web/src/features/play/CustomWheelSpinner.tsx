/**
 * A user-built wheel, spinning.
 *
 * Geometry matches every other wheel in the app: wedge `i` is centred on
 * `i * seg`, so the conic gradient starts half a wedge back and the landing
 * angle uses `i * seg` too.
 *
 * The wedge list is padded to at least eight (see `wedgesFor`), so a
 * three-option wheel still looks like a wheel. Padding repeats every option the
 * same number of times, so the odds are untouched.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { Icon } from '../../components/icons/Icon';
import { wedgesFor, type CustomWheel } from '../../lib/customWheels';

const SPIN_MS = 4200;
const SETTLE_MS = SPIN_MS + 50;
const REDUCED_MS = 180;

/** Eight hues around the colour wheel, so neighbours never share a tone. */
const HUES = [265, 20, 190, 330, 45, 155, 290, 95];

interface Props {
  wheel: CustomWheel;
  reducedMotion: boolean;
  /** Announced when the wheel settles, so the parent can react. */
  onLanded?: (option: string) => void;
}

export function CustomWheelSpinner({ wheel, reducedMotion, onLanded }: Props) {
  const { t } = useI18n();
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const wedges = useMemo(() => wedgesFor(wheel.options), [wheel.options]);
  const seg = wedges.length ? 360 / wedges.length : 0;
  const duration = reducedMotion ? REDUCED_MS : SPIN_MS;
  const ease = `transform ${duration}ms cubic-bezier(.12,.76,.14,1)`;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Editing the wheel invalidates whatever it last landed on.
  useEffect(() => {
    setLanded(null);
  }, [wheel.updatedAt]);

  const background = useMemo(() => {
    if (!wedges.length) return 'var(--surface-2)';
    const stops = wedges
      .map((_, i) => {
        const hue = HUES[i % HUES.length];
        return `hsl(${hue} 62% 42%) ${i * seg}deg ${(i + 1) * seg}deg`;
      })
      .join(', ');
    return `conic-gradient(from ${-seg / 2}deg, ${stops})`;
  }, [wedges, seg]);

  const spin = useCallback(() => {
    if (spinning || wedges.length < 2) return;
    // Draw against the *options*, then pick which copy of it to stop on, so the
    // padding can never skew the odds.
    const optionIndex = Math.floor(Math.random() * wheel.options.length);
    const copies = wedges.length / wheel.options.length;
    const copy = Math.floor(Math.random() * copies);
    const index = copy * wheel.options.length + optionIndex;

    setSpinning(true);
    setLanded(null);
    setRotation((prev) => {
      const desired = (360 - index * seg) % 360;
      return prev - (prev % 360) + 360 * (reducedMotion ? 1 : 5) + desired;
    });

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setLanded(index);
        setSpinning(false);
        onLanded?.(wheel.options[optionIndex]);
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [onLanded, reducedMotion, seg, spinning, wedges.length, wheel.options]);

  // Above a dozen wedges the text stops fitting; the readout still names it.
  const labelled = wedges.length <= 12;

  return (
    <div className="cwheel">
      <span className="cwheel__pointer" aria-hidden />

      <button
        className="cwheel__disc"
        style={{ background, transform: `rotate(${rotation}deg)`, transition: ease }}
        onClick={spin}
        disabled={spinning || wedges.length < 2}
        aria-label={t('wheels.spin')}
      >
        <span
          className="cwheel__spokes"
          aria-hidden
          style={{
            background: `repeating-conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,.45) 0deg .6deg, transparent .6deg ${seg}deg)`,
          }}
        />
        <span
          className="cwheel__winner"
          aria-hidden
          style={{
            background: `conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,.3) 0deg ${seg}deg, transparent ${seg}deg)`,
            transform: `rotate(${(landed ?? 0) * seg}deg)`,
            opacity: !spinning && landed != null ? 1 : 0,
          }}
        />
      </button>

      {/* Gyroscope: the layer turns +R, each label turns −R, so text stays upright. */}
      {labelled && (
        <span
          className="cwheel__labels"
          aria-hidden
          style={{ transform: `rotate(${rotation}deg)`, transition: ease }}
        >
          {wedges.map((option, i) => (
            <span
              key={`${option}-${i}`}
              className="cwheel__label"
              style={{
                transform: `rotate(${i * seg}deg) translateY(-96px) rotate(${-(i * seg) - rotation}deg)`,
                transition: ease,
              }}
            >
              {option}
            </span>
          ))}
        </span>
      )}

      <button
        className={`cwheel__hub ${spinning ? 'is-spinning' : ''}`}
        onClick={spin}
        disabled={spinning || wedges.length < 2}
        aria-label={t('wheels.spin')}
      >
        <span className="cwheel__hub-emoji">{wheel.emoji}</span>
        <span className="cwheel__hub-text">
          {spinning ? t('wheels.spinning') : t('wheels.spin')}
        </span>
      </button>

      <p className="cwheel__readout" aria-live="polite">
        {!spinning && landed != null ? (
          <strong>{wedges[landed]}</strong>
        ) : wedges.length < 2 ? (
          t('wheels.needTwo')
        ) : (
          <span className="muted">
            <Icon name="dice" size={14} /> {t('wheels.optionCount', { n: wheel.options.length })}
          </span>
        )}
      </p>
    </div>
  );
}
