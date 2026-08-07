/** Rolkolommen — the quietest of the ten. No round corners, no glass. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { TIME_PRESETS, formatMinutes } from '../../../lib/session';
import type { MechanicProps } from '../types';

const ROW_H = 52;
const STEP_MS = 70;
const ROLL_MS = 1500;
const SETTLE_MS = 620;

export function ReelsMechanic({
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
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [settling, setSettling] = useState(false);
  const interval = useRef<number | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);

  const rolling = phase === 'running';
  const done = phase === 'done' && pick;

  const transports: string[] = [t('session.walk'), t('session.bike'), t('session.car')];
  const times = TIME_PRESETS.map((m) => formatMinutes(m, lang));
  const cats = api.categories.map((c) => categoryName(c, lang));
  const columns = [cats, times, transports];

  const stop = useCallback(() => {
    window.clearInterval(interval.current);
    window.clearTimeout(timer.current);
  }, []);
  useEffect(() => stop, [stop]);

  const roll = () => {
    if (rolling || !cats.length) return;
    const drawn = api.drawPick();
    if (!drawn) return;
    onStart(drawn);

    const landing = [
      Math.max(
        0,
        api.categories.findIndex((c) => c.id === drawn.category.id)
      ),
      Math.max(0, times.indexOf(drawn.durationLabel)),
      1,
    ];

    if (reducedMotion) {
      setOffsets(landing);
      timer.current = window.setTimeout(onSettled, 180);
      return;
    }

    setSettling(false);
    interval.current = window.setInterval(() => {
      setOffsets((o) => o.map((v, i) => (v + 1) % columns[i].length));
    }, STEP_MS);
    timer.current = window.setTimeout(() => {
      window.clearInterval(interval.current);
      setSettling(true);
      setOffsets(landing);
      timer.current = window.setTimeout(onSettled, SETTLE_MS);
    }, ROLL_MS);
  };

  const reset = () => {
    stop();
    setSettling(false);
    onReset();
  };

  return (
    <div className="mech mech--reels">
      <p className="mech__eyebrow reels__eyebrow">{t('reels.eyebrow')}</p>
      <h1 className="mech__title reels__title">{t('reels.title')}</h1>

      <div className="mech__stage">
        <div className="reels" aria-hidden={!done}>
          <span className="reels__band" />
          {columns.map((items, col) => (
            <div className="reels__col" key={col}>
              <div
                className="reels__strip"
                style={{
                  transform: `translateY(${-offsets[col] * ROW_H}px)`,
                  transition: settling
                    ? `transform ${SETTLE_MS}ms cubic-bezier(.16,.9,.2,1)`
                    : rolling
                      ? `transform ${STEP_MS}ms linear`
                      : 'none',
                }}
              >
                {items.map((label, i) => (
                  <span
                    key={label + i}
                    className={`reels__cell ${i === offsets[col] ? 'is-active' : ''}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <span className="reels__fade reels__fade--top" />
          <span className="reels__fade reels__fade--bottom" />
        </div>

        <div className="reels__legend">
          <span>{t('reels.category')}</span>
          <span>{t('reels.time')}</span>
          <span>{t('reels.transport')}</span>
        </div>

        <div className="reels__result" aria-live="polite">
          {done && pick && (
            <>
              <p className="reels__result-place">{pick.placeName ?? pick.title}</p>
              <p className="reels__result-meta">
                {[categoryName(pick.category, lang), pick.distanceLabel, pick.durationLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <button className="reels__roll" onClick={roll} disabled={rolling}>
            {t('reels.roll')}
          </button>
        )}
        <button className="reels__clear" onClick={reset}>
          {t('reels.clear')}
        </button>
      </div>
    </div>
  );
}
