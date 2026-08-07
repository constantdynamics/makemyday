/**
 * Verzegelde brief — drag the wax seal down until it breaks, then read what
 * today has in store. A plain "open" button does the same for keyboard users.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { tint } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';

const MAX_DRAG = 120;
const BREAK_AT = 108;
const OPEN_MS = 620;

export function LetterMechanic({
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
  const [sealY, setSealY] = useState(0);
  const [broken, setBroken] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const startY = useRef<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const done = phase === 'done' && pick;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Print today's message before the envelope can be opened.
  useEffect(() => {
    if (phase !== 'idle') return;
    const drawn = api.drawPick();
    if (drawn) onStart(drawn);
    // One message per idle round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const open = useCallback(() => {
    if (broken) return;
    setBroken(true);
    setSnapping(false);
    setSealY(MAX_DRAG);
    timer.current = window.setTimeout(onSettled, reducedMotion ? 60 : OPEN_MS);
  }, [broken, onSettled, reducedMotion]);

  const onDown = (e: React.PointerEvent) => {
    if (broken) return;
    startY.current = e.clientY;
    setSnapping(false);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (startY.current == null || broken) return;
    setSealY(Math.max(0, Math.min(MAX_DRAG, e.clientY - startY.current)));
  };
  const onUp = () => {
    if (startY.current == null || broken) return;
    startY.current = null;
    if (sealY >= BREAK_AT) {
      open();
    } else {
      setSnapping(true);
      setSealY(0);
    }
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setSealY(0);
    setBroken(false);
    setSnapping(false);
    onReset();
  };

  const flapAngle = (sealY / MAX_DRAG) * 165;

  return (
    <div className="mech mech--letter">
      <p className="mech__eyebrow letter__eyebrow">{t('letter.eyebrow')}</p>

      <div className="mech__stage">
        {!done ? (
          <div className="letter__envelope">
            <span
              className="letter__flap"
              aria-hidden
              style={{
                transform: `rotateX(${flapAngle}deg)`,
                transition: snapping ? 'transform 420ms cubic-bezier(.22,1,.36,1)' : 'none',
              }}
            />
            <span className="letter__body" aria-hidden />
            <button
              className="letter__seal"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={() => sealY === 0 && open()}
              style={{
                transform: `translate(-50%, ${sealY}px) rotate(${sealY * 1.6}deg)`,
                transition: snapping ? 'transform 420ms cubic-bezier(.22,1,.36,1)' : 'none',
              }}
              aria-label={t('letter.open')}
            >
              <Icon name="compass" size={26} color="#ffd9dd" />
            </button>
          </div>
        ) : (
          <article className="letter__note">
            <span
              className="letter__note-icon"
              style={{ background: tint(pick.category.color, 22), color: pick.category.color }}
            >
              <Icon name={pick.category.icon} size={24} />
            </span>
            <span className="letter__note-cat">
              {categoryName(pick.category, lang).toUpperCase()}
            </span>
            <h2 className="letter__note-place">{pick.placeName ?? pick.title}</h2>
            <p className="letter__note-meta">
              {[pick.distanceLabel, pick.durationLabel].filter(Boolean).join(' · ')}
            </p>
            <p className="letter__note-line">{t('letter.beforeDark')}</p>
          </article>
        )}

        <p className="letter__hint" aria-live="polite">
          {broken ? t('letter.broken') : t('letter.drag')}
        </p>
      </div>

      <div className="mech__actions">
        {done ? (
          <>
            <Button size="lg" block icon="check" onClick={onAccept}>
              {t('dashboard.accept')}
            </Button>
            <button className="mech__reset" onClick={reset} aria-label={t('letter.new')}>
              <Icon name="refresh" size={20} />
            </button>
          </>
        ) : (
          <Button size="lg" block variant="secondary" icon="message" onClick={open}>
            {t('letter.open')}
          </Button>
        )}
      </div>
    </div>
  );
}
