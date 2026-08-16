import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { useSession } from '../../contexts/SessionContext';
import { useCatalog, categoryName } from '../../hooks/useCatalog';
import { useNearby } from '../../hooks/useNearby';
import { useCompletions } from '../../hooks/useCompletions';
import { useWeather } from '../../hooks/useWeather';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { uploadAdventurePhoto } from '../../lib/uploadPhoto';
import { weatherSummary } from '../../lib/weather';
import { openLabel } from '../../lib/openingHours';
import {
  searchRadius,
  TRANSPORT_ICON,
  TIME_PRESETS,
  GROUP_ICON,
  skipLimit,
  formatMinutes,
  type Transport,
  type GroupSize,
} from '../../lib/session';
import {
  loadMechanic,
  saveMechanic,
  mechanicMeta,
  tint,
  type MechanicId,
} from '../../lib/mechanic';
import { usePick, type Pick } from '../pick/usePick';
import { WheelMechanic } from '../pick/mechanics/WheelMechanic';
import { MechanicHost } from '../pick/MechanicHost';
import { MethodSheet } from '../pick/MethodSheet';
import type { Phase } from '../pick/types';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Card, Badge, Segmented } from '../../components/ui/primitives';
import { Icon } from '../../components/icons/Icon';
import { StatGrid } from '../profile/StatGrid';
import { directionsUrl, formatDistance } from '../../lib/geo';
import './dashboard.css';
import '../pick/pick.css';

export default function DashboardScreen() {
  const { t, lang } = useI18n();
  const { profile, isGuest } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const { config, update, skipsUsed, recordSkip, resetSkips } = useSession();
  const { categories, activities, loading } = useCatalog();
  const { count, complete, chickenOut } = useCompletions();
  const { origin, pois, status, requestLocation } = useNearby(
    categories,
    searchRadius(config),
    'all'
  );
  const weather = useWeather(origin);
  const reducedMotion = useReducedMotion();

  /* ---- How chance decides: the wheel, or one of the nine take-overs ---- */
  const [mechanic, setMechanic] = useState<MechanicId>(loadMechanic);
  const [methodOpen, setMethodOpen] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const meta = mechanicMeta(mechanic);

  const api = usePick({
    categories,
    activities,
    pois,
    origin,
    config,
    preferIndoor: !!weather?.preferIndoor,
    lang,
  });

  const [adventure, setAdventure] = useState<Pick | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [rating, setRating] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [chickening, setChickening] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const skipsLeft = Math.max(0, skipLimit(profile?.is_premium) - skipsUsed);

  // Optional verification photo for the adventure being completed.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  );
  const fileInput = useRef<HTMLInputElement>(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (lang === 'nl')
      return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
    return h < 6
      ? 'Good night'
      : h < 12
        ? 'Good morning'
        : h < 18
          ? 'Good afternoon'
          : 'Good evening';
  }, [lang]);

  const name = profile?.display_name || profile?.username || t('dashboard.explorer');

  /* ---- Mechanic state machine, shared by the wheel and the host ---- */
  // A mechanic captures its callbacks when it starts, seconds before they fire,
  // so the settle handlers read the draw from a ref rather than stale state.
  const pickRef = useRef<Pick | null>(null);

  const onStart = useCallback(
    (supplied?: Pick | null) => {
      const next = supplied ?? api.drawPick();
      if (!next) return;
      pickRef.current = next;
      setPick(next);
      setPhase('running');
    },
    [api]
  );
  const onSettled = useCallback(() => setPhase('done'), []);
  const onReset = useCallback(() => {
    pickRef.current = null;
    setPhase('idle');
    setPick(null);
  }, []);

  const openAdventure = useCallback((next: Pick) => {
    setPhotoFile(null);
    setRating(0);
    setAdventure(next);
  }, []);

  /** The wheel opens the sheet by itself; the take-overs do it on "ik doe het". */
  const onWheelSettled = useCallback(() => {
    setPhase('done');
    if (pickRef.current) openAdventure(pickRef.current);
  }, [openAdventure]);

  const onAccept = useCallback(() => {
    if (!pickRef.current) return;
    setHostOpen(false);
    openAdventure(pickRef.current);
  }, [openAdventure]);

  const chooseMechanic = (id: MechanicId) => {
    setMechanic(id);
    saveMechanic(id);
    setMethodOpen(false);
    onReset();
    // The wheel lives on the dashboard; everything else takes over right away.
    setHostOpen(id !== 'wheel');
  };

  const closeAdventure = () => {
    setAdventure(null);
    setPhotoFile(null);
    setRating(0);
    onReset();
  };

  const accept = async () => {
    if (!adventure) return;
    setCompleting(true);
    try {
      // Photos need storage, which needs an account; a guest's adventure counts
      // in every other way rather than being refused outright.
      let photoUrl: string | null = null;
      if (photoFile && profile && !isGuest) {
        photoUrl = await uploadAdventurePhoto(profile.id, photoFile);
      }
      const prof = await complete({
        title: adventure.title,
        categoryId: adventure.category.id,
        source: adventure.source,
        lat: adventure.coords?.lat ?? null,
        lng: adventure.coords?.lng ?? null,
        placeName: adventure.placeName ?? null,
        points: 10 + adventure.category.sort_order,
        photoUrl,
        rating: rating || null,
      });
      show(t('toast.completed', { n: prof.xp - (profile?.xp ?? 0) }), 'success');
      closeAdventure();
    } catch {
      show(t('common.error'), 'error');
    } finally {
      setCompleting(false);
    }
  };

  // Chicken out: a limited, streak-breaking way to back out of a dare.
  const chicken = async () => {
    if (!adventure) return;
    if (skipsLeft <= 0) {
      show(t('chicken.noneLeft'), 'info');
      return;
    }
    setChickening(true);
    try {
      await chickenOut();
      recordSkip();
      show(t('chicken.done'), 'info');
      closeAdventure();
    } catch {
      show(t('common.error'), 'error');
    } finally {
      setChickening(false);
    }
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
    e.target.value = '';
  };

  const nearbyPreview = pois.slice(0, 4);

  return (
    <div className="dash">
      <header className="dash__top">
        <div>
          <p className="dash__hello">{greeting},</p>
          <h1 className="dash__name">{name} 👋</h1>
        </div>
        <button className="dash__avatar" onClick={() => navigate('/app/profile')}>
          {profile?.avatar_emoji ?? '🧭'}
        </button>
      </header>

      <StatGrid
        completed={count}
        streak={profile?.streak_count ?? 0}
        xp={profile?.xp ?? 0}
        level={profile?.level ?? 1}
      />

      <button className="session-bar" onClick={() => setSetupOpen(true)}>
        <span className="session-bar__pill">
          <Icon name={TRANSPORT_ICON[config.transport]} size={16} />
          {t(`session.${config.transport}`)}
        </span>
        <span className="session-bar__pill">
          <Icon name="clock" size={16} />
          {formatMinutes(config.minutes, lang)}
        </span>
        <span className="session-bar__pill">
          <Icon name={GROUP_ICON[config.group]} size={16} />
          {t(`session.${config.group}`)}
        </span>
        <span className="session-bar__edit">
          <Icon name="sliders" size={18} />
        </span>
      </button>

      {weather && (
        <div className="weather-chip">
          <Icon name={weatherSummary(weather, lang).icon} size={15} />
          <span>{weatherSummary(weather, lang).label}</span>
          {weather.preferIndoor && <span className="muted">· {t('weather.indoorTip')}</span>}
        </div>
      )}

      <section className="dash__spin">
        <div className="method-bar">
          <span
            className="method-bar__dot"
            style={{ background: meta.accent, boxShadow: `0 0 8px ${meta.accent}` }}
            aria-hidden
          />
          <span className="method-bar__name">{t(`mechanic.${mechanic}.name`)}</span>
          <button className="method-bar__swap" onClick={() => setMethodOpen(true)}>
            <Icon name="refresh" size={15} />
            {t('method.swap')}
          </button>
        </div>

        {mechanic === 'wheel' ? (
          <div className="stage">
            <h2 className="section-title">{t('dashboard.spinTitle')}</h2>
            <p className="dash__hint">{t('dashboard.spinHint')}</p>
            <WheelMechanic
              phase={phase}
              pick={pick}
              api={api}
              onStart={onStart}
              onSettled={onWheelSettled}
              onAccept={onAccept}
              onReset={onReset}
              reducedMotion={reducedMotion}
              categories={categories}
              loading={loading}
            />
          </div>
        ) : (
          <button
            className="method-entry"
            onClick={() => setHostOpen(true)}
            style={{
              border: `1px solid ${tint(meta.accent, 40)}`,
              background: `linear-gradient(165deg, ${tint(meta.accent, 20)}, rgba(255,255,255,.04))`,
            }}
          >
            <span
              className="method-entry__glow"
              aria-hidden
              style={{
                background: `radial-gradient(circle, ${tint(meta.accent, 40)}, transparent 68%)`,
              }}
            />
            <span
              className="method-entry__icon"
              style={{
                background: tint(meta.accent, 22),
                color: meta.accent,
                border: `1px solid ${tint(meta.accent, 40)}`,
              }}
            >
              <Icon name={meta.icon} size={26} />
            </span>
            <h2 className="method-entry__name">{t(`mechanic.${mechanic}.name`)}</h2>
            <p className="method-entry__desc">{t(`mechanic.${mechanic}.desc`)}</p>
            <span className="method-entry__cta" style={{ color: meta.accent }}>
              {t('method.open')} <Icon name="chevron-right" size={18} />
            </span>
          </button>
        )}
      </section>

      {status !== 'ready' && status !== 'loading' && (
        <Card className="dash__loc">
          <Icon name="map-pin" size={20} color="var(--brand-500)" />
          <div>
            <strong>{t('dashboard.locationOff')}</strong>
            <p>{t('dashboard.usingCurated')}</p>
          </div>
          <Button size="sm" onClick={requestLocation} loading={status === 'locating'}>
            {t('dashboard.enableLocation')}
          </Button>
        </Card>
      )}

      {nearbyPreview.length > 0 && (
        <section className="dash__nearby">
          <div className="section-head">
            <h2 className="section-title">{t('dashboard.nearby')}</h2>
            <button className="link" onClick={() => navigate('/app/explore')}>
              {t('dashboard.seeAll')}
            </button>
          </div>
          <div className="dash__nearby-list">
            {nearbyPreview.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <Card
                  key={p.id}
                  interactive
                  className="poi-row"
                  onClick={() => navigate('/app/explore')}
                >
                  <span
                    className="poi-row__icon"
                    style={{
                      background: `color-mix(in srgb, ${cat?.color ?? '#888'} 16%, transparent)`,
                      color: cat?.color,
                    }}
                  >
                    <Icon name={cat?.icon ?? 'map-pin'} size={18} />
                  </span>
                  <div className="poi-row__body">
                    <strong>{p.name}</strong>
                    <span className="muted">{cat ? categoryName(cat, lang) : p.kind}</span>
                  </div>
                  <span className="poi-row__dist">{formatDistance(p.distance, lang)}</span>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {hostOpen && (
        <MechanicHost
          mechanic={mechanic}
          phase={phase}
          pick={pick}
          api={api}
          onStart={onStart}
          onSettled={onSettled}
          onAccept={onAccept}
          onReset={onReset}
          reducedMotion={reducedMotion}
          onClose={() => {
            setHostOpen(false);
            onReset();
          }}
          onSwap={() => setMethodOpen(true)}
        />
      )}

      <MethodSheet
        open={methodOpen}
        current={mechanic}
        onClose={() => setMethodOpen(false)}
        onPick={chooseMechanic}
      />

      <Sheet open={setupOpen} onClose={() => setSetupOpen(false)} title={t('session.title')}>
        <p className="muted session-setup__sub">{t('session.subtitle')}</p>

        <p className="field__label">{t('session.transport')}</p>
        <Segmented<Transport>
          value={config.transport}
          onChange={(v) => update({ transport: v })}
          options={[
            { value: 'walk', label: t('session.walk'), icon: 'walk' },
            { value: 'bike', label: t('session.bike'), icon: 'bike' },
            { value: 'car', label: t('session.car'), icon: 'car' },
          ]}
        />

        <p className="field__label">{t('session.time')}</p>
        <div className="session-setup__times">
          {TIME_PRESETS.map((m) => (
            <button
              key={m}
              className={`chip ${config.minutes === m ? 'is-active' : ''}`}
              onClick={() => update({ minutes: m })}
            >
              {formatMinutes(m, lang)}
            </button>
          ))}
        </div>

        <p className="field__label">{t('session.company')}</p>
        <Segmented<GroupSize>
          value={config.group}
          onChange={(v) => update({ group: v })}
          options={[
            { value: 'solo', label: t('session.solo'), icon: 'user' },
            { value: 'duo', label: t('session.duo'), icon: 'heart' },
            { value: 'group', label: t('session.group'), icon: 'users' },
          ]}
        />

        <Button
          block
          size="lg"
          className="session-setup__apply"
          onClick={() => {
            resetSkips();
            setSetupOpen(false);
          }}
        >
          {t('session.apply')}
        </Button>
      </Sheet>

      <Sheet open={!!adventure} onClose={closeAdventure} title={t('dashboard.yourAdventure')}>
        {adventure && (
          <div className="adv">
            <div
              className="adv__emoji"
              style={{
                background: `color-mix(in srgb, ${adventure.category.color} 18%, transparent)`,
              }}
            >
              <span>{adventure.emoji}</span>
            </div>
            <Badge color={adventure.category.color}>{categoryName(adventure.category, lang)}</Badge>
            <h2 className="adv__title">{adventure.title}</h2>
            {adventure.description && <p className="adv__desc">{adventure.description}</p>}
            {adventure.distance != null && (
              <p className="adv__meta">
                <Icon name="map-pin" size={15} /> {formatDistance(adventure.distance, lang)}
              </p>
            )}
            {adventure.openState != null && (
              <p className={`adv__meta ${adventure.openState ? 'is-open' : 'is-closed'}`}>
                <Icon name="clock" size={15} /> {openLabel(adventure.openState, lang)}
                {adventure.openingHours ? ` · ${adventure.openingHours}` : ''}
              </p>
            )}

            <div className="adv__rating" role="radiogroup" aria-label={t('rating.label')}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`adv__star ${n <= rating ? 'is-on' : ''}`}
                  onClick={() => setRating(n === rating ? 0 : n)}
                  aria-label={`${n}`}
                >
                  <Icon name="star" size={26} />
                </button>
              ))}
            </div>
            <p className="adv__rating-hint muted">{t('rating.hint')}</p>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={onPickPhoto}
            />
            {photoPreview ? (
              <div className="adv__photo">
                <img src={photoPreview} alt="" />
                <button
                  className="adv__photo-x"
                  onClick={() => setPhotoFile(null)}
                  aria-label={t('photo.remove')}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            ) : (
              <button className="adv__add-photo" onClick={() => fileInput.current?.click()}>
                <Icon name="camera" size={18} />
                <span>{t('photo.add')}</span>
                <small>{t('photo.hint')}</small>
              </button>
            )}

            <div className="adv__actions">
              <Button size="lg" block icon="check" loading={completing} onClick={accept}>
                {completing && photoFile ? t('photo.uploading') : t('dashboard.accept')}
              </Button>
              <div className="adv__row">
                <Button
                  variant="secondary"
                  icon="x"
                  loading={chickening}
                  disabled={skipsLeft <= 0}
                  onClick={chicken}
                >
                  {skipsLeft > 0
                    ? t('chicken.action', { n: skipsLeft })
                    : t('chicken.noneLeftShort')}
                </Button>
                {adventure.coords && (
                  <Button
                    variant="secondary"
                    icon="navigation"
                    onClick={() =>
                      window.open(directionsUrl(adventure.coords!, adventure.placeName), '_blank')
                    }
                  >
                    {t('dashboard.navigate')}
                  </Button>
                )}
              </div>
              <p className="adv__chicken-note muted">{t('chicken.note')}</p>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
