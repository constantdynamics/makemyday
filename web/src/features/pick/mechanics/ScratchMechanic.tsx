/**
 * Kraslot — a light card in an otherwise dark app. Wipe the silver away.
 *
 * The foil is an SVG rect whose mask gains a black circle per scratch point;
 * sixteen points is enough to count as revealed. A button does the same job for
 * anyone not using a pointer.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { tint } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';

const VB_W = 300;
const VB_H = 336;
const HOLE_R = 30;
/** Ignore points closer than this so the list can't run away with us. */
const MIN_GAP = 16;
const NEEDED = 16;
const FADE_MS = 420;

interface Point {
  x: number;
  y: number;
}

export function ScratchMechanic({
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
  const [points, setPoints] = useState<Point[]>([]);
  const [cleared, setCleared] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const done = phase === 'done' && pick;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // A ticket needs a prize printed on it before you can scratch it open.
  useEffect(() => {
    if (phase !== 'idle') return;
    const drawn = api.drawPick();
    if (drawn) onStart(drawn);
    // Deal exactly one ticket per idle round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const reveal = useCallback(() => {
    if (cleared) return;
    setCleared(true);
    timer.current = window.setTimeout(onSettled, reducedMotion ? 60 : FADE_MS);
  }, [cleared, onSettled, reducedMotion]);

  const addPoint = (e: React.PointerEvent) => {
    if (!card.current || cleared) return;
    const r = card.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VB_W;
    const y = ((e.clientY - r.top) / r.height) * VB_H;
    setPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.hypot(last.x - x, last.y - y) < MIN_GAP) return prev;
      const next = [...prev, { x, y }];
      if (next.length >= NEEDED) reveal();
      return next;
    });
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setPoints([]);
    setCleared(false);
    onReset();
  };

  const progress = Math.min(100, (points.length / NEEDED) * 100);

  return (
    <div className="mech mech--scratch">
      <h1 className="mech__title scratch__title">{t('scratch.title')}</h1>
      <p className="mech__sub">{t('scratch.sub')}</p>

      <div className="mech__stage">
        <div
          className="scratch__card"
          ref={card}
          onPointerDown={(e) => {
            drawing.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            addPoint(e);
          }}
          onPointerMove={(e) => drawing.current && addPoint(e)}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        >
          {pick && (
            <div className="scratch__prize">
              <span
                className="scratch__prize-icon"
                style={{ background: tint(pick.category.color, 22), color: pick.category.color }}
              >
                <Icon name={pick.category.icon} size={26} />
              </span>
              <span className="scratch__prize-cat">
                {categoryName(pick.category, lang).toUpperCase()}
              </span>
              <h2 className="scratch__prize-place">{pick.placeName ?? pick.title}</h2>
              <p className="scratch__prize-meta">
                {[pick.distanceLabel, pick.durationLabel].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          <svg
            className="scratch__foil"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            aria-hidden
            style={{ opacity: cleared ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
          >
            <defs>
              <linearGradient id="mmd-foil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e7e9f0" />
                <stop offset="35%" stopColor="#9ea3b5" />
                <stop offset="65%" stopColor="#d6d9e4" />
                <stop offset="100%" stopColor="#8b90a5" />
              </linearGradient>
              <mask id="mmd-foil-mask">
                <rect width={VB_W} height={VB_H} fill="#fff" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={HOLE_R} fill="#000" />
                ))}
              </mask>
            </defs>
            <rect width={VB_W} height={VB_H} fill="url(#mmd-foil)" mask="url(#mmd-foil-mask)" />
          </svg>

          {points.length === 0 && !cleared && (
            <span className="scratch__hint" aria-hidden>
              {t('scratch.here')}
            </span>
          )}
        </div>

        <div className="scratch__progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <Button size="lg" block variant="secondary" icon="sparkles" onClick={reveal}>
            {t('scratch.reveal')}
          </Button>
        )}
        <button className="mech__reset" onClick={reset} aria-label={t('scratch.new')}>
          <Icon name="refresh" size={20} />
        </button>
      </div>
    </div>
  );
}
