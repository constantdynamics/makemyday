/**
 * Windroos — a wheel with eight wedges, one per compass point.
 *
 * The direction is the result here. Where the category wheel asks *what*, this
 * one asks *which way*, then looks for something that actually lies that way.
 * Without a location fix it still works: you get a direction and a curated idea,
 * which is the whole "just start walking" premise.
 *
 * Geometry: wedge `i` is centred on `i * 45°`, matching the category wheel, so
 * the disc's conic gradient starts half a wedge back at `-22.5deg`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import type { MechanicProps } from '../types';

const SEG = 45;
const POINTS = 8;
const SPIN_MS = 4200;
const SETTLE_MS = SPIN_MS + 50;
const REDUCED_MS = 180;

export function WindMechanic({
  phase,
  pick,
  api,
  onStart,
  onSettled,
  onAccept,
  onReset,
  reducedMotion,
}: MechanicProps) {
  const { t, lang } = useI18n();
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const spinning = phase === 'running';
  const done = phase === 'done' && pick;
  const duration = reducedMotion ? REDUCED_MS : SPIN_MS;
  const ease = `transform ${duration}ms cubic-bezier(.12,.76,.14,1)`;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (phase === 'idle') setLanded(null);
  }, [phase]);

  const wedges = useMemo(() => {
    const stops = Array.from({ length: POINTS }, (_, i) => {
      const tone = i % 2 === 0 ? 'rgba(90,209,200,.26)' : 'rgba(90,209,200,.1)';
      return `${tone} ${i * SEG}deg ${(i + 1) * SEG}deg`;
    }).join(', ');
    return `conic-gradient(from ${-SEG / 2}deg, ${stops})`;
  }, []);

  const spin = useCallback(() => {
    if (spinning) return;
    const octant = Math.floor(Math.random() * POINTS);
    // Draw first, so the wheel knows where to stop; the result stays hidden
    // until the spin settles.
    const drawn = api.drawInSector(octant);
    if (!drawn) return;

    const desired = (360 - octant * SEG) % 360;
    setLanded(null);
    setRotation((prev) => prev - (prev % 360) + 360 * (reducedMotion ? 1 : 5) + desired);
    onStart(drawn);

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setLanded(octant);
        onSettled();
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [api, onSettled, onStart, reducedMotion, spinning]);

  const reset = () => {
    window.clearTimeout(timer.current);
    setLanded(null);
    onReset();
  };

  const abbr = (i: number) => t(`wind.abbr.${i}`);
  const full = (i: number) => t(`wind.name.${i}`);
  const counted = landed != null ? api.sectorCounts[landed] : 0;

  return (
    <div className="mech mech--wind">
      <p className="mech__eyebrow">{t('wind.eyebrow')}</p>
      <h3 className="mech__title">{t('wind.title')}</h3>
      <p className="mech__sub">{t('wind.sub')}</p>

      <div className="mech__stage wind__stage">
        <div className="wind__rose">
          <span className="wind__pointer" aria-hidden />
          <button
            className="wind__disc"
            style={{ background: wedges, transform: `rotate(${rotation}deg)`, transition: ease }}
            onClick={spin}
            disabled={spinning}
            aria-label={t('wind.spin')}
          >
            <span
              className="wind__spokes"
              aria-hidden
              style={{
                background: `repeating-conic-gradient(from ${-SEG / 2}deg, rgba(255,255,255,.34) 0deg .5deg, transparent .5deg ${SEG}deg)`,
              }}
            />
            <span
              className="wind__winner"
              aria-hidden
              style={{
                background: `conic-gradient(from ${-SEG / 2}deg, rgba(90,209,200,.5) 0deg ${SEG}deg, transparent ${SEG}deg)`,
                transform: `rotate(${(landed ?? 0) * SEG}deg)`,
                opacity: !spinning && landed != null ? 1 : 0,
              }}
            />
          </button>

          {/* Gyroscope: the ring turns +R, each label turns −R, so text stays upright. */}
          <span
            className="wind__labels"
            aria-hidden
            style={{ transform: `rotate(${rotation}deg)`, transition: ease }}
          >
            {Array.from({ length: POINTS }, (_, i) => (
              <span
                key={i}
                className={`wind__label ${i % 2 === 0 ? 'is-cardinal' : ''} ${
                  !spinning && landed === i ? 'is-landed' : ''
                }`}
                style={{
                  transform: `rotate(${i * SEG}deg) translateY(-98px) rotate(${-(i * SEG) - rotation}deg)`,
                  transition: ease,
                }}
              >
                {abbr(i)}
              </span>
            ))}
          </span>

          <button
            className={`wind__hub ${spinning ? 'is-spinning' : ''}`}
            onClick={spin}
            disabled={spinning}
            aria-label={t('wind.spin')}
          >
            <Icon name="navigation" size={20} color="#0b1a1c" />
            <span>{spinning ? t('wind.spinning') : t('wind.spin')}</span>
          </button>
        </div>

        <div className="wind__readout" aria-live="polite">
          {done && landed != null ? (
            <>
              <p className="wind__heading">{full(landed)}</p>
              <p className="wind__count">
                {counted > 0 ? t('wind.found', { n: String(counted) }) : t('wind.nothingThatWay')}
              </p>
              <div className="mech-result">
                <span
                  className="mech-result__icon"
                  style={{
                    background: `color-mix(in srgb, ${pick.category.color} 22%, transparent)`,
                    color: pick.category.color,
                  }}
                >
                  <Icon name={pick.category.icon} size={24} />
                </span>
                <span className="mech-result__body">
                  <span className="mech-result__place">{pick.placeName ?? pick.title}</span>
                  <span className="mech-result__meta">
                    {[categoryName(pick.category, lang), pick.distanceLabel]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <p className="wind__idle">{spinning ? t('wind.spinning') : t('wind.idle')}</p>
          )}
        </div>
      </div>

      {done && (
        <div className="mech__actions">
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
          <button className="mech__reset" onClick={reset} aria-label={t('common.retry')}>
            <Icon name="refresh" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
