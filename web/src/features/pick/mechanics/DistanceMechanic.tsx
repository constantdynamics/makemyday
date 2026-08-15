/**
 * Kilometerrad — the wheel decides how far you go.
 *
 * The wedges are not fixed: they are the rings your session actually allows,
 * computed from transport *and* time (`distanceBands` in `lib/session`). An hour
 * on foot gets a wheel that tops out around a kilometre; four hours by car gets
 * one that reaches tens of them. Landing on a ring then draws a place inside it.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { useSession } from '../../../contexts/SessionContext';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { formatKm, transportLabel, formatMinutes } from '../../../lib/session';
import type { MechanicProps } from '../types';

const SPIN_MS = 4200;
const SETTLE_MS = SPIN_MS + 50;
const REDUCED_MS = 180;

/** Outer rings read warmer, so "far" looks far before you read the number. */
const RING_TONES = [
  'rgba(240,167,44,.14)',
  'rgba(240,167,44,.22)',
  'rgba(240,167,44,.3)',
  'rgba(240,167,44,.38)',
  'rgba(240,167,44,.46)',
  'rgba(240,167,44,.56)',
];

export function DistanceMechanic({
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
  const { config } = useSession();
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const bands = api.bands;
  const seg = bands.length ? 360 / bands.length : 0;
  const spinning = phase === 'running';
  const done = phase === 'done' && pick;
  const duration = reducedMotion ? REDUCED_MS : SPIN_MS;
  const ease = `transform ${duration}ms cubic-bezier(.12,.76,.14,1)`;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (phase === 'idle') setLanded(null);
  }, [phase]);

  const wedges = useMemo(() => {
    if (!bands.length) return 'var(--surface-2)';
    const stops = bands
      .map((_, i) => `${RING_TONES[i % RING_TONES.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(', ');
    return `conic-gradient(from ${-seg / 2}deg, ${stops})`;
  }, [bands, seg]);

  const spin = useCallback(() => {
    if (spinning || !bands.length) return;
    const index = Math.floor(Math.random() * bands.length);
    const drawn = api.drawInBand(bands[index]);
    if (!drawn) return;

    const desired = (360 - index * seg) % 360;
    setLanded(null);
    setRotation((prev) => prev - (prev % 360) + 360 * (reducedMotion ? 1 : 5) + desired);
    onStart(drawn);

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setLanded(index);
        onSettled();
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [api, bands, onSettled, onStart, reducedMotion, seg, spinning]);

  const reset = () => {
    window.clearTimeout(timer.current);
    setLanded(null);
    onReset();
  };

  /** "0,6–1,5" — the unit is printed once, under the wheel. */
  const bandLabel = (i: number) =>
    `${formatKm(bands[i].fromKm, lang)}–${formatKm(bands[i].toKm, lang)}`;

  const reachLabel = bands.length ? formatKm(bands[bands.length - 1].toKm, lang) : '—';

  return (
    <div className="mech mech--distance">
      <p className="mech__eyebrow">{t('distance.eyebrow')}</p>
      <h3 className="mech__title">{t('distance.title')}</h3>
      <p className="mech__sub">
        {t('distance.basis', {
          transport: transportLabel(config.transport, lang),
          time: formatMinutes(config.minutes, lang),
          km: reachLabel,
        })}
      </p>

      <div className="mech__stage dist__stage">
        <div className="dist__rose">
          <span className="dist__pointer" aria-hidden />
          <button
            className="dist__disc"
            style={{ background: wedges, transform: `rotate(${rotation}deg)`, transition: ease }}
            onClick={spin}
            disabled={spinning || !bands.length}
            aria-label={t('distance.spin')}
          >
            <span
              className="dist__spokes"
              aria-hidden
              style={{
                background: `repeating-conic-gradient(from ${-seg / 2}deg, rgba(255,255,255,.3) 0deg .5deg, transparent .5deg ${seg}deg)`,
              }}
            />
            <span
              className="dist__winner"
              aria-hidden
              style={{
                background: `conic-gradient(from ${-seg / 2}deg, rgba(240,167,44,.45) 0deg ${seg}deg, transparent ${seg}deg)`,
                transform: `rotate(${(landed ?? 0) * seg}deg)`,
                opacity: !spinning && landed != null ? 1 : 0,
              }}
            />
          </button>

          <span
            className="dist__labels"
            aria-hidden
            style={{ transform: `rotate(${rotation}deg)`, transition: ease }}
          >
            {bands.map((_, i) => (
              <span
                key={i}
                className={`dist__label ${!spinning && landed === i ? 'is-landed' : ''}`}
                style={{
                  transform: `rotate(${i * seg}deg) translateY(-96px) rotate(${-(i * seg) - rotation}deg)`,
                  transition: ease,
                }}
              >
                {bandLabel(i)}
              </span>
            ))}
          </span>

          <button
            className={`dist__hub ${spinning ? 'is-spinning' : ''}`}
            onClick={spin}
            disabled={spinning || !bands.length}
            aria-label={t('distance.spin')}
          >
            <Icon name="ruler" size={20} color="#241701" />
            <span>{spinning ? t('distance.spinning') : t('distance.spin')}</span>
          </button>
        </div>

        <div className="dist__readout" aria-live="polite">
          {done && landed != null ? (
            <>
              <p className="dist__band">
                {bandLabel(landed)} <span className="dist__unit">{t('distance.km')}</span>
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
                    {[categoryName(pick.category, lang), pick.distanceLabel ?? t('distance.noFix')]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <p className="dist__idle">{spinning ? t('distance.spinning') : t('distance.idle')}</p>
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
