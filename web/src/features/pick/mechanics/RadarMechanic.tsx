/** Radar — sweep the neighbourhood and lock onto one contact. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import type { MechanicProps } from '../types';

const SCAN_MS = 2400;
const SCREEN = 300;

export function RadarMechanic({
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
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const running = phase === 'running';
  const done = phase === 'done' && pick;
  const radiusKm = (api.radiusMeters / 1000).toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-US');

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Place each contact at its real bearing, scaled by distance. */
  const contacts = useMemo(() => {
    const max = api.blips.reduce((m, b) => Math.max(m, b.distance), 1);
    return api.blips.map((b) => {
      const r = 34 + (b.distance / max) * (SCREEN / 2 - 52);
      const rad = ((b.heading - 90) * Math.PI) / 180;
      return {
        ...b,
        x: SCREEN / 2 + Math.cos(rad) * r,
        y: SCREEN / 2 + Math.sin(rad) * r,
      };
    });
  }, [api.blips]);

  const scan = () => {
    const drawn = api.drawPick();
    if (running || !drawn) return;
    onStart(drawn);
    setLog([
      t('radar.logRadius', { m: api.radiusMeters, n: api.blips.length }),
      t('radar.logBearing'),
    ]);

    const finish = () => {
      setLog((l) => [
        ...l,
        t('radar.logLock', { name: drawn.placeName ?? drawn.title }),
        [
          drawn.headingLabel,
          drawn.heading != null ? `${Math.round(drawn.heading)}°` : null,
          drawn.distanceLabel,
          categoryName(drawn.category, lang).toLowerCase(),
        ]
          .filter(Boolean)
          .join(' · '),
      ]);
      onSettled();
    };
    timer.current = window.setTimeout(finish, reducedMotion ? 180 : SCAN_MS);
  };

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setLog([]);
    onReset();
  }, [onReset]);

  const status = done ? t('radar.locked') : running ? t('radar.scanning') : t('radar.ready');
  const lockedId = done && pick?.placeName ? pick.placeName : null;

  return (
    <div className="mech mech--radar">
      <div className="radar__top">
        <span>{t('radar.scanLabel', { km: radiusKm })}</span>
        <span>{status}</span>
      </div>

      <div className="mech__stage">
        <div className="radar__screen" aria-hidden>
          <span className="radar__ring radar__ring--outer" />
          <span className="radar__ring radar__ring--mid" />
          <span className="radar__ring radar__ring--inner" />
          <span className="radar__cross radar__cross--h" />
          <span className="radar__cross radar__cross--v" />
          <span className={`radar__sweep ${running ? 'is-running' : ''}`} />
          {contacts.map((c) => {
            const locked = lockedId != null && c.name === lockedId;
            return (
              <span
                key={c.id}
                className={`radar__blip ${locked ? 'is-locked' : ''}`}
                style={{ left: c.x, top: c.y }}
              >
                {locked && <span className="radar__lock-ring" />}
              </span>
            );
          })}
        </div>

        <div className="radar__log" aria-live="polite">
          {log.length === 0 ? (
            <p>{t('radar.logIdle')}</p>
          ) : (
            log.map((line, i) => <p key={i}>{`> ${line}`}</p>)
          )}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <button className="radar__start" onClick={scan} disabled={running}>
            {t('radar.start')}
          </button>
        )}
        {done && (
          <button className="radar__start radar__start--ghost" onClick={reset}>
            {t('common.retry')}
          </button>
        )}
      </div>
    </div>
  );
}
