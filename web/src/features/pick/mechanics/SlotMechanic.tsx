/** Gokkast — three windows, one pull. Wat · hoelang · waar. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import type { MechanicProps } from '../types';
import type { Pick } from '../usePick';

const TICK_MS = 70;
const ROLL_MS = 1700;

/** Cheap title-case for the raw OSM `kind` ("art_gallery" → "Art gallery"). */
function prettyKind(kind: string): string {
  const s = kind.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function SlotMechanic({
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
  const [tick, setTick] = useState(0);
  const [pulled, setPulled] = useState(false);
  const interval = useRef<number | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);

  const rolling = phase === 'running';
  const done = phase === 'done' && pick;

  const stop = useCallback(() => {
    window.clearInterval(interval.current);
    window.clearTimeout(timer.current);
  }, []);
  useEffect(() => stop, [stop]);

  const pull = () => {
    if (rolling) return;
    const drawn = api.drawPick();
    if (!drawn) return;
    onStart(drawn);
    setPulled(true);
    window.setTimeout(() => setPulled(false), 600);

    if (reducedMotion) {
      timer.current = window.setTimeout(onSettled, 180);
      return;
    }
    interval.current = window.setInterval(() => setTick((n) => n + 1), TICK_MS);
    timer.current = window.setTimeout(() => {
      window.clearInterval(interval.current);
      onSettled();
    }, ROLL_MS);
  };

  const reset = () => {
    stop();
    onReset();
  };

  /** What each window shows: settled values when done, blur-cycling otherwise. */
  const windowValue = (row: number, settled: Pick | null): string => {
    if (settled) {
      if (row === 0) return categoryName(settled.category, lang);
      if (row === 1) return settled.durationLabel;
      return settled.placeName ?? settled.title;
    }
    const cats = api.categories;
    if (row === 0 && cats.length) return categoryName(cats[(tick + 1) % cats.length], lang);
    if (row === 1) return api.durationLabel;
    const kinds = api.blips.length ? api.blips : null;
    if (kinds) return kinds[(tick + 5) % kinds.length].name;
    return cats.length ? categoryName(cats[(tick + 3) % cats.length], lang) : '—';
  };

  const rows = [t('slot.what'), t('slot.howLong'), t('slot.where')];

  return (
    <div className="mech mech--slot">
      <p className="mech__eyebrow">{t('slot.eyebrow')}</p>
      <h1 className="mech__title">{t('slot.title')}</h1>
      <p className="mech__sub">{t('slot.sub')}</p>

      <div className="mech__stage">
        <div className="slot">
          <div className="slot__cabinet">
            {rows.map((label, i) => (
              <div className="slot__window" key={label}>
                <span className="slot__label">{label}</span>
                <span
                  className="slot__value"
                  style={rolling && !reducedMotion ? { filter: 'blur(1.5px)' } : undefined}
                >
                  {windowValue(i, done ? pick : null)}
                </span>
              </div>
            ))}
          </div>
          <div className="slot__lever" aria-hidden>
            <span className="slot__lever-bar" />
            <span className={`slot__lever-knob ${pulled ? 'is-pulled' : ''}`} />
          </div>
        </div>

        <div className="slot__payout" aria-live="polite">
          {done && pick ? (
            <>
              <p className="slot__payout-label">{t('slot.payout')}</p>
              <p className="slot__payout-place">{pick.placeName ?? pick.title}</p>
              <p className="slot__payout-meta">
                {[categoryName(pick.category, lang), pick.distanceLabel, pick.durationLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {pick.source === 'osm' && pick.placeName && (
                <p className="slot__payout-kind">{prettyKind(pick.description)}</p>
              )}
            </>
          ) : (
            <p className="slot__payout-label">{rolling ? t('slot.rolling') : ' '}</p>
          )}
        </div>
      </div>

      <div className="mech__actions">
        {done ? (
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
        ) : (
          <button className="slot__pull" onClick={pull} disabled={rolling}>
            {t('slot.pull')}
          </button>
        )}
        <button className="mech__reset" onClick={reset} aria-label={t('common.retry')}>
          <Icon name="refresh" size={20} />
        </button>
      </div>
    </div>
  );
}
