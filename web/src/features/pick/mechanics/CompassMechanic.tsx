/** Kompas — it gives you a direction, not a place. Walk that way. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import type { MechanicProps } from '../types';

const SWING_MS = 2600;

export function CompassMechanic({
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
  const [angle, setAngle] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const running = phase === 'running';
  const done = phase === 'done' && pick;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const release = () => {
    if (running) return;
    const drawn = api.drawPick();
    if (!drawn) return;
    onStart(drawn);
    // Two full turns before settling on the real bearing.
    const target = drawn.heading ?? Math.random() * 360;
    setAngle((prev) => prev - (prev % 360) + (reducedMotion ? 0 : 720) + target);
    timer.current = window.setTimeout(onSettled, reducedMotion ? 180 : SWING_MS);
  };

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    onReset();
  }, [onReset]);

  const heading = pick?.heading != null ? Math.round(pick.heading) : null;

  return (
    <div className="mech mech--compass">
      <div className="compass__top">
        <span>{t('compass.eyebrow')}</span>
        <span>
          {pick?.coords ? `${pick.coords.lat.toFixed(4)} · ${pick.coords.lng.toFixed(4)}` : '— · —'}
        </span>
      </div>

      <div className="mech__stage">
        <div className="compass__rose" aria-hidden>
          <span className="compass__ring compass__ring--outer" />
          <span className="compass__ticks" />
          <span className="compass__ring compass__ring--mid" />
          <span className="compass__ring compass__ring--inner" />
          <span className="compass__cardinal compass__cardinal--n">{t('compass.n')}</span>
          <span className="compass__cardinal compass__cardinal--e">{t('compass.e')}</span>
          <span className="compass__cardinal compass__cardinal--s">{t('compass.s')}</span>
          <span className="compass__cardinal compass__cardinal--w">{t('compass.w')}</span>
          <span
            className="compass__needle"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: `transform ${reducedMotion ? 180 : SWING_MS}ms cubic-bezier(.16,.9,.2,1)`,
            }}
          >
            <span className="compass__needle-n" />
            <span className="compass__needle-s" />
          </span>
          <span className="compass__pivot" />
        </div>

        <div className="compass__readout" aria-live="polite">
          {done && pick ? (
            <>
              <p className="compass__bearing">{heading != null ? `${heading}°` : '—'}</p>
              <p className="compass__axis">
                {[pick.headingLabel, pick.distanceLabel].filter(Boolean).join(' · ') ||
                  t('compass.noFix')}
              </p>
              <p className="compass__place">{pick.placeName ?? pick.title}</p>
              <p className="compass__cat">{categoryName(pick.category, lang)}</p>
            </>
          ) : (
            <p className="compass__idle">{running ? t('compass.swinging') : t('compass.idle')}</p>
          )}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <button className="compass__release" onClick={release} disabled={running}>
            {t('compass.release')}
          </button>
        )}
        {done && (
          <button className="compass__release compass__release--ghost" onClick={reset}>
            {t('common.retry')}
          </button>
        )}
      </div>
    </div>
  );
}
