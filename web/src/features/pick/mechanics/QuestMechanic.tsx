/**
 * Spelmodus — chance picks the *place*, not the activity.
 *
 * Two wheels in sequence. The first lands on one of eight wind directions, the
 * second on a kilometre band derived from your transport and time. Together
 * they describe a coordinate: "2,5 km to the north-east" is a real spot on the
 * map, and whatever stands closest to it is where you are going, however odd.
 * That arbitrariness is the whole game — you don't pick the destination, the
 * wheels do.
 *
 * Wind and distance used to be two separate mechanics; they belong together,
 * because on their own neither one names a location.
 *
 * Geometry note: wedge `i` is centred on `i * seg`, so the conic gradient starts
 * half a wedge back — same convention as the category wheel.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { useSession } from '../../../contexts/SessionContext';
import { categoryName } from '../../../hooks/useCatalog';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/icons/Icon';
import { directionsUrl, formatDistance } from '../../../lib/geo';
import { formatKm, transportLabel, formatMinutes } from '../../../lib/session';
import type { Spot } from '../usePick';
import type { MechanicProps } from '../types';

const POINTS = 8;
const WIND_SEG = 360 / POINTS;
const SPIN_MS = 3600;
const SETTLE_MS = SPIN_MS + 50;
const REDUCED_MS = 180;

/** Which wheel the player is on. */
type Stage = 'wind' | 'distance' | 'result';

export function QuestMechanic({
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
  const [stage, setStage] = useState<Stage>('wind');
  const [spinning, setSpinning] = useState(false);
  const [windRot, setWindRot] = useState(0);
  const [distRot, setDistRot] = useState(0);
  const [octant, setOctant] = useState<number | null>(null);
  const [bandIndex, setBandIndex] = useState<number | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Rings for the direction we landed on — the sea has no places in it, so a
  // bearing with nothing at 20 km simply never offers a 20 km wedge.
  const bands = useMemo(() => (octant == null ? api.bands : api.bandsFor(octant)), [api, octant]);
  const distSeg = bands.length ? 360 / bands.length : 0;
  const duration = reducedMotion ? REDUCED_MS : SPIN_MS;
  const ease = `transform ${duration}ms cubic-bezier(.12,.76,.14,1)`;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // A fresh round from the host resets the whole two-wheel sequence.
  useEffect(() => {
    if (phase === 'idle') {
      setStage('wind');
      setOctant(null);
      setBandIndex(null);
      setSpot(null);
      setSpinning(false);
    }
  }, [phase]);

  const windWedges = useMemo(() => {
    const stops = Array.from({ length: POINTS }, (_, i) => {
      const tone = i % 2 === 0 ? 'rgba(90,209,200,.26)' : 'rgba(90,209,200,.1)';
      return `${tone} ${i * WIND_SEG}deg ${(i + 1) * WIND_SEG}deg`;
    }).join(', ');
    return `conic-gradient(from ${-WIND_SEG / 2}deg, ${stops})`;
  }, []);

  const distWedges = useMemo(() => {
    if (!bands.length) return 'var(--surface-2)';
    const stops = bands
      .map((_, i) => {
        // Outer rings read warmer, so "far" looks far before you read the number.
        const a = 0.12 + (i / Math.max(1, bands.length - 1)) * 0.44;
        return `rgba(240,167,44,${a.toFixed(2)}) ${i * distSeg}deg ${(i + 1) * distSeg}deg`;
      })
      .join(', ');
    return `conic-gradient(from ${-distSeg / 2}deg, ${stops})`;
  }, [bands, distSeg]);

  /** Spins the direction wheel, then hands over to the distance wheel. */
  const spinWind = useCallback(() => {
    if (spinning) return;
    const open = api.availableOctants;
    const landed = open[Math.floor(Math.random() * open.length)];
    setSpinning(true);
    setWindRot((prev) => {
      const desired = (360 - landed * WIND_SEG) % 360;
      return prev - (prev % 360) + 360 * (reducedMotion ? 1 : 4) + desired;
    });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setOctant(landed);
        setSpinning(false);
        setStage('distance');
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [api, reducedMotion, spinning]);

  /** Spins the distance wheel; the two results together name the spot. */
  const spinDistance = useCallback(() => {
    if (spinning || octant == null || !bands.length) return;
    const landed = Math.floor(Math.random() * bands.length);
    // Resolve the spot up front so the host has the pick before the reveal,
    // exactly like the other mechanics; it stays hidden until the wheel stops.
    const resolved = api.drawAtSpot(octant, bands[landed]);
    if (!resolved.pick) return;

    setSpinning(true);
    setDistRot((prev) => {
      const desired = (360 - landed * distSeg) % 360;
      return prev - (prev % 360) + 360 * (reducedMotion ? 1 : 4) + desired;
    });
    onStart(resolved.pick);

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setBandIndex(landed);
        setSpot(resolved);
        setSpinning(false);
        setStage('result');
        onSettled();
      },
      reducedMotion ? REDUCED_MS + 40 : SETTLE_MS
    );
  }, [api, bands, distSeg, octant, onSettled, onStart, reducedMotion, spinning]);

  const again = () => {
    window.clearTimeout(timer.current);
    onReset();
  };

  const bandLabel = (i: number) =>
    `${formatKm(bands[i].fromKm, lang)}–${formatKm(bands[i].toKm, lang)}`;

  const done = stage === 'result' && phase === 'done' && pick;

  return (
    <div className="mech mech--quest">
      <p className="mech__eyebrow">{t('quest.eyebrow')}</p>
      <h3 className="mech__title">{t('quest.title')}</h3>
      <p className="mech__sub">
        {t('quest.basis', {
          transport: transportLabel(config.transport, lang),
          time: formatMinutes(config.minutes, lang),
        })}
      </p>

      {/* Two steps, so it always reads as one game rather than two wheels. */}
      <ol className="quest__steps" aria-hidden>
        <li className={stage === 'wind' ? 'is-active' : octant != null ? 'is-done' : ''}>
          <span>1</span>
          {octant != null ? t(`quest.abbr.${octant}`) : t('quest.stepWind')}
        </li>
        <li className={stage === 'distance' ? 'is-active' : bandIndex != null ? 'is-done' : ''}>
          <span>2</span>
          {bandIndex != null ? `${bandLabel(bandIndex)} km` : t('quest.stepDistance')}
        </li>
      </ol>

      <div className="mech__stage quest__stage">
        {stage === 'wind' ? (
          <div className="quest__rose quest__rose--wind">
            <span className="quest__pointer quest__pointer--wind" aria-hidden />
            <button
              className="quest__disc quest__disc--wind"
              style={{
                background: windWedges,
                transform: `rotate(${windRot}deg)`,
                transition: ease,
              }}
              onClick={spinWind}
              disabled={spinning}
              aria-label={t('quest.spinWind')}
            >
              <span
                className="quest__spokes"
                aria-hidden
                style={{
                  background: `repeating-conic-gradient(from ${-WIND_SEG / 2}deg, rgba(255,255,255,.34) 0deg .5deg, transparent .5deg ${WIND_SEG}deg)`,
                }}
              />
            </button>
            {/* Gyroscope: the ring turns +R, each label turns −R, so text stays upright. */}
            <span
              className="quest__labels"
              aria-hidden
              style={{ transform: `rotate(${windRot}deg)`, transition: ease }}
            >
              {Array.from({ length: POINTS }, (_, i) => (
                <span
                  key={i}
                  className={`quest__label ${i % 2 === 0 ? 'is-cardinal' : ''} ${
                    api.availableOctants.includes(i) ? '' : 'is-empty'
                  }`}
                  style={{
                    transform: `rotate(${i * WIND_SEG}deg) translateY(-92px) rotate(${-(i * WIND_SEG) - windRot}deg)`,
                    transition: ease,
                  }}
                >
                  {t(`quest.abbr.${i}`)}
                </span>
              ))}
            </span>
            <button
              className="quest__hub quest__hub--wind"
              onClick={spinWind}
              disabled={spinning}
              aria-label={t('quest.spinWind')}
            >
              <Icon name="navigation" size={19} color="#0b1a1c" />
              <span>{spinning ? t('quest.spinning') : t('quest.spinWind')}</span>
            </button>
          </div>
        ) : (
          <div className="quest__rose quest__rose--dist">
            <span className="quest__pointer quest__pointer--dist" aria-hidden />
            <button
              className="quest__disc quest__disc--dist"
              style={{
                background: distWedges,
                transform: `rotate(${distRot}deg)`,
                transition: ease,
              }}
              onClick={spinDistance}
              disabled={spinning || stage === 'result'}
              aria-label={t('quest.spinDistance')}
            >
              <span
                className="quest__spokes"
                aria-hidden
                style={{
                  background: `repeating-conic-gradient(from ${-distSeg / 2}deg, rgba(255,255,255,.3) 0deg .5deg, transparent .5deg ${distSeg}deg)`,
                }}
              />
            </button>
            <span
              className="quest__labels"
              aria-hidden
              style={{ transform: `rotate(${distRot}deg)`, transition: ease }}
            >
              {bands.map((_, i) => (
                <span
                  key={i}
                  className="quest__label quest__label--dist"
                  style={{
                    transform: `rotate(${i * distSeg}deg) translateY(-90px) rotate(${-(i * distSeg) - distRot}deg)`,
                    transition: ease,
                  }}
                >
                  {bandLabel(i)}
                </span>
              ))}
            </span>
            {stage !== 'result' && (
              <button
                className="quest__hub quest__hub--dist"
                onClick={spinDistance}
                disabled={spinning}
                aria-label={t('quest.spinDistance')}
              >
                <Icon name="ruler" size={19} color="#241701" />
                <span>{spinning ? t('quest.spinning') : t('quest.spinDistance')}</span>
              </button>
            )}
          </div>
        )}

        <div className="quest__readout" aria-live="polite">
          {done && octant != null && bandIndex != null ? (
            <>
              <p className="quest__verdict">
                {t('quest.verdict', {
                  distance: bandLabel(bandIndex),
                  direction: t(`quest.name.${octant}`),
                })}
              </p>
              {spot?.target ? (
                <p className="quest__coords">
                  {spot.target.lat.toFixed(4)} · {spot.target.lng.toFixed(4)}
                  {spot.offMeters != null && (
                    <> · {t('quest.off', { d: formatDistance(spot.offMeters, lang) })}</>
                  )}
                </p>
              ) : (
                <p className="quest__coords">{t('quest.noFix')}</p>
              )}

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
                    {[categoryName(pick.category, lang), pick.distanceLabel]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </div>

              {/* The spot is the destination even when nothing stands on it. */}
              {spot?.target && (
                <a
                  className="quest__navigate"
                  href={directionsUrl(pick.coords ?? spot.target, pick.placeName)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="navigation" size={15} />
                  {t('dashboard.navigate')}
                </a>
              )}
            </>
          ) : (
            <p className="quest__idle">
              {spinning
                ? t('quest.spinning')
                : stage === 'wind'
                  ? t('quest.idleWind')
                  : t('quest.idleDistance')}
            </p>
          )}
        </div>
      </div>

      {done && (
        <div className="mech__actions">
          <Button size="lg" block icon="check" onClick={onAccept}>
            {t('dashboard.accept')}
          </Button>
          <button className="mech__reset" onClick={again} aria-label={t('common.retry')}>
            <Icon name="refresh" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
