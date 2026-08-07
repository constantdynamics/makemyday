/**
 * Kaartendek — throw away what you don't fancy. What's left, you do.
 *
 * All three cards are real suggestions; the two you discard have to be genuine
 * or the choice feels rigged. The last one standing is the draw.
 */
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { tint } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';
import type { Pick } from '../usePick';

const HAND = 3;

export function DeckMechanic({
  phase,
  pick,
  api,
  onStart,
  onSettled,
  onAccept,
  onReset,
}: MechanicProps) {
  const { t, lang } = useI18n();
  const [hand, setHand] = useState<Pick[]>([]);
  const [tossed, setTossed] = useState(0);

  const done = phase === 'done' && pick;

  const deal = useCallback(() => {
    const cards = api.drawSeries(HAND);
    if (cards.length === 0) return;
    setHand(cards);
    setTossed(0);
    // The card that survives is the one the app actually drew.
    onStart(cards[cards.length - 1]);
  }, [api, onStart]);

  useEffect(() => {
    if (phase === 'idle' && hand.length === 0) deal();
  }, [deal, hand.length, phase]);

  const toss = () => {
    const next = tossed + 1;
    setTossed(next);
    if (next >= hand.length - 1) onSettled();
  };

  const reset = () => {
    setHand([]);
    setTossed(0);
    onReset();
  };

  const left = Math.max(0, hand.length - tossed);
  const isLast = left <= 1;

  return (
    <div className="mech mech--deck">
      <div className="deck__head">
        <h1 className="mech__title deck__title">{t('deck.title')}</h1>
        <span className="deck__count">
          {t('deck.left', { n: left, total: hand.length || HAND })}
        </span>
      </div>
      <p className="mech__sub deck__sub">{t('deck.sub')}</p>

      <div className="mech__stage">
        <div className="deck__stack">
          {hand.map((card, i) => {
            const depth = i - tossed;
            const gone = depth < 0;
            return (
              <article
                key={card.title + i}
                className={`deck__card ${gone ? 'is-gone' : ''}`}
                style={{
                  // Mixed into a dark base, not into transparent: the cards are
                  // stacked, so a see-through face shows the whole hand at once.
                  background: `linear-gradient(165deg, color-mix(in srgb, ${card.category.color} 20%, #16112a), #100c1e)`,
                  transform: gone
                    ? 'translateX(-420px) rotate(-22deg)'
                    : `translateY(${depth * -14}px) scale(${1 - depth * 0.05}) rotate(${(depth - 1) * 2.5}deg)`,
                  opacity: gone ? 0 : 1,
                  zIndex: 10 - Math.max(0, depth),
                  pointerEvents: gone ? 'none' : undefined,
                }}
                aria-hidden={gone || depth > 0}
              >
                <span
                  className="deck__card-icon"
                  style={{ background: tint(card.category.color, 22), color: card.category.color }}
                >
                  <Icon name={card.category.icon} size={22} />
                </span>
                <span className="deck__card-cat">
                  {categoryName(card.category, lang).toUpperCase()}
                </span>
                <h2 className="deck__card-place">{card.placeName ?? card.title}</h2>
                <p className="deck__card-meta">
                  {[card.distanceLabel, card.durationLabel].filter(Boolean).join(' · ')}
                </p>
                <span className="deck__card-pill">
                  {depth === 0 && isLast ? t('deck.remains') : t('deck.onTop')}
                </span>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('deck.take')}
          </Button>
        ) : (
          <Button
            size="lg"
            block
            variant="secondary"
            icon="x"
            onClick={toss}
            disabled={!hand.length}
          >
            {t('deck.toss')}
          </Button>
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
