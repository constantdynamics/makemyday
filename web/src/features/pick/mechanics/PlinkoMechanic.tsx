/** Plinko — drop the ball and let the pins decide which bin it lands in. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { tint } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';

const FALL_MS = 1600;

export function PlinkoMechanic({
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
  const [target, setTarget] = useState<number | null>(null);
  const [falling, setFalling] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const bins = api.categories;
  const running = phase === 'running';
  const done = phase === 'done' && pick;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const drop = () => {
    if (running || !bins.length) return;
    const drawn = api.drawPick();
    if (!drawn) return;
    const index = Math.max(
      0,
      bins.findIndex((c) => c.id === drawn.category.id)
    );
    onStart(drawn);
    setTarget(index);

    if (reducedMotion) {
      timer.current = window.setTimeout(onSettled, 180);
      return;
    }
    // Next frame, so the ball starts from the top before it transitions down.
    requestAnimationFrame(() => setFalling(true));
    timer.current = window.setTimeout(onSettled, FALL_MS);
  };

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setFalling(false);
    setTarget(null);
    onReset();
  }, [onReset]);

  /** Horizontal centre of the target bin, as a percentage of the field. */
  const laneLeft = target != null && bins.length ? ((target + 0.5) / bins.length) * 100 : 50;

  return (
    <div className="mech mech--plinko">
      <div className="plinko__head">
        <h1 className="mech__title plinko__title">{t('plinko.title')}</h1>
      </div>

      <div className="mech__stage">
        <div className="plinko__field">
          <span className="plinko__pins" aria-hidden />
          <span className="plinko__pins plinko__pins--offset" aria-hidden />
          <span
            className="plinko__ball"
            aria-hidden
            style={{
              left: falling ? `${laneLeft}%` : '50%',
              top: falling ? 'calc(100% - 128px)' : '14px',
              transition: falling
                ? `left ${FALL_MS}ms linear, top ${FALL_MS}ms cubic-bezier(.5,0,.85,.6)`
                : 'none',
              opacity: target == null ? 0.85 : 1,
            }}
          >
            <span className={`plinko__ball-inner ${falling ? 'is-wobbling' : ''}`} />
          </span>

          <div className="plinko__bins">
            {bins.map((c, i) => (
              <div
                key={c.id}
                className={`plinko__bin ${done && target === i ? 'is-hit' : ''}`}
                style={
                  done && target === i
                    ? { background: tint(c.color, 20), color: c.color }
                    : undefined
                }
              >
                <Icon name={c.icon} size={16} />
                <span>{categoryName(c, lang).split(/[\s&]+/)[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          {done && pick && (
            <button className="mech-result" onClick={onAccept}>
              <span
                className="mech-result__icon"
                style={{ background: tint(pick.category.color, 18), color: pick.category.color }}
              >
                <Icon name={pick.category.icon} size={20} />
              </span>
              <span className="mech-result__body">
                <span className="mech-result__place">{pick.placeName ?? pick.title}</span>
                <span className="mech-result__meta">
                  {[categoryName(pick.category, lang), pick.distanceLabel]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <Icon name="chevron-right" size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <button className="plinko__drop" onClick={drop} disabled={running}>
            {t('plinko.drop')}
          </button>
        )}
        {done && (
          <button className="mech__reset" onClick={reset} aria-label={t('common.retry')}>
            <Icon name="refresh" size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
