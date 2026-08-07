/**
 * Vasthouden — the whole screen is the button. Hold longer, go further.
 *
 * Keyboard works the same way (hold space or enter), and there is a plain
 * button for anyone who can't hold at all.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { tint } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';

const STEP_MS = 40;
const STEP_PCT = 2.6;
const MIN_KM = 0.2;
const MAX_KM = 12;

export function HoldMechanic({
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
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const interval = useRef<number | undefined>(undefined);
  const chargeRef = useRef(0);

  const done = phase === 'done' && pick;
  const km = MIN_KM + (charge / 100) * (MAX_KM - MIN_KM);

  const clear = useCallback(() => window.clearInterval(interval.current), []);
  useEffect(() => clear, [clear]);

  const begin = useCallback(() => {
    if (holding || done) return;
    setHolding(true);
    clear();
    interval.current = window.setInterval(() => {
      chargeRef.current = Math.min(100, chargeRef.current + STEP_PCT);
      setCharge(chargeRef.current);
    }, STEP_MS);
  }, [clear, done, holding]);

  const release = useCallback(() => {
    if (!holding) return;
    setHolding(false);
    clear();
    const drawn = api.drawByRange(chargeRef.current / 100);
    if (!drawn) return;
    onStart(drawn);
    window.setTimeout(onSettled, reducedMotion ? 60 : 420);
  }, [api, clear, holding, onSettled, onStart, reducedMotion]);

  /** The button alternative: charge halfway and draw straight away. */
  const pickForMe = () => {
    const drawn = api.drawByRange(0.5);
    if (!drawn) return;
    chargeRef.current = 50;
    setCharge(50);
    onStart(drawn);
    window.setTimeout(onSettled, reducedMotion ? 60 : 420);
  };

  const reset = () => {
    clear();
    chargeRef.current = 0;
    setCharge(0);
    setHolding(false);
    onReset();
  };

  const aura = 0.25 + (charge / 100) * 1.05;

  return (
    <div
      className="mech mech--hold"
      style={
        done && pick
          ? {
              background: `radial-gradient(90% 60% at 50% 45%, ${tint(pick.category.color, 26)}, #06050c)`,
            }
          : undefined
      }
    >
      <div className="mech__stage hold__stage">
        <button
          className="hold__pad"
          onPointerDown={begin}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              begin();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') release();
          }}
          disabled={!!done}
          aria-label={t('hold.press')}
        >
          <span
            className="hold__aura"
            aria-hidden
            style={{ transform: `translate(-50%,-50%) scale(${aura})` }}
          />
          {done && pick ? (
            <span className="hold__result">
              <span
                className="hold__result-icon"
                style={{ background: tint(pick.category.color, 22), color: pick.category.color }}
              >
                <Icon name={pick.category.icon} size={30} />
              </span>
              <span className="hold__result-place">{pick.placeName ?? pick.title}</span>
              <span className="hold__result-meta">
                {[categoryName(pick.category, lang), pick.distanceLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
          ) : (
            <span className="hold__gauge">
              <span className="hold__label">{t('hold.press')}</span>
              <span
                className="hold__count"
                style={{ textShadow: `0 0 ${20 + charge / 2}px rgba(157,123,255,.75)` }}
              >
                {km.toFixed(1).replace('.', lang === 'nl' ? ',' : '.')}
              </span>
              <span className="hold__unit">{t('hold.km')}</span>
            </span>
          )}
        </button>

        <p className="hold__explain" aria-live="polite">
          {done ? '' : t('hold.explain')}
        </p>
      </div>

      <div className="mech__actions">
        {done ? (
          <>
            <Button size="lg" block icon="check" onClick={onAccept}>
              {t('dashboard.accept')}
            </Button>
            <button className="mech__reset" onClick={reset} aria-label={t('hold.again')}>
              <Icon name="refresh" size={20} />
            </button>
          </>
        ) : (
          <Button size="lg" block variant="secondary" icon="sparkles" onClick={pickForMe}>
            {t('hold.pickForMe')}
          </Button>
        )}
      </div>
    </div>
  );
}
