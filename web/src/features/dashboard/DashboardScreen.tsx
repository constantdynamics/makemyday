import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { useSession } from '../../contexts/SessionContext';
import {
  useCatalog,
  activityTitle,
  activityDescription,
  categoryName,
} from '../../hooks/useCatalog';
import { useNearby } from '../../hooks/useNearby';
import { useCompletions } from '../../hooks/useCompletions';
import { uploadAdventurePhoto } from '../../lib/uploadPhoto';
import {
  TRANSPORT_RADIUS,
  TRANSPORT_ICON,
  TIME_PRESETS,
  GROUP_ICON,
  sessionFiltered,
  formatMinutes,
  type Transport,
  type GroupSize,
} from '../../lib/session';
import { SpinWheel } from '../../components/SpinWheel';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Card, Badge, Segmented } from '../../components/ui/primitives';
import { Icon } from '../../components/icons/Icon';
import { StatGrid } from '../profile/StatGrid';
import { directionsUrl, formatDistance, type LatLng } from '../../lib/geo';
import type { Category } from '../../types/db';
import './dashboard.css';

interface Adventure {
  title: string;
  description: string;
  category: Category;
  source: 'curated' | 'osm';
  coords?: LatLng;
  placeName?: string;
  distance?: number;
  emoji: string;
}

export default function DashboardScreen() {
  const { t, lang } = useI18n();
  const { profile, isGuest } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const { config, update } = useSession();
  const { categories, activities, loading } = useCatalog();
  const { count, complete } = useCompletions();
  const { origin, pois, status, requestLocation } = useNearby(
    categories,
    TRANSPORT_RADIUS[config.transport],
    'all'
  );

  const [spinning, setSpinning] = useState(false);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [completing, setCompleting] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

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

  const buildAdventure = (cat: Category): Adventure => {
    const localPois = pois.filter((p) => p.categoryId === cat.id);
    if (origin && localPois.length) {
      const poi = localPois[Math.floor(Math.random() * Math.min(localPois.length, 8))];
      const verb = lang === 'nl' ? 'Bezoek' : 'Visit';
      return {
        title: `${verb} ${poi.name}`,
        description: categoryName(cat, lang),
        category: cat,
        source: 'osm',
        coords: { lat: poi.lat, lng: poi.lng },
        placeName: poi.name,
        distance: poi.distance,
        emoji: '📍',
      };
    }
    const inCat = sessionFiltered(
      activities.filter((a) => a.category_id === cat.id),
      config
    );
    const pool = inCat.length ? inCat : sessionFiltered(activities, config);
    const a = pool[Math.floor(Math.random() * pool.length)];
    return {
      title: activityTitle(a, lang),
      description: activityDescription(a, lang),
      category: cat,
      source: 'curated',
      emoji: a.emoji,
    };
  };

  const onResult = (cat: Category) => {
    setSpinning(false);
    setPhotoFile(null);
    setAdventure(buildAdventure(cat));
  };

  const closeAdventure = () => {
    setAdventure(null);
    setPhotoFile(null);
  };

  const accept = async () => {
    if (!adventure) return;
    if (isGuest) {
      show(t('toast.loginRequired'), 'info');
      navigate('/auth?mode=register');
      return;
    }
    setCompleting(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile && profile) {
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
      });
      show(t('toast.completed', { n: prof.xp - (profile?.xp ?? 0) }), 'success');
      closeAdventure();
    } catch {
      show(t('common.error'), 'error');
    } finally {
      setCompleting(false);
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

      <section className="dash__spin">
        <h2 className="section-title">{t('dashboard.spinTitle')}</h2>
        <p className="dash__hint">{t('dashboard.spinHint')}</p>
        {loading ? (
          <div className="wheel wheel--skeleton" />
        ) : (
          <SpinWheel
            categories={categories}
            spinning={spinning}
            onSpinStart={() => setSpinning(true)}
            onResult={onResult}
            label={t('dashboard.spinTitle')}
          />
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
                    style={{ background: `${cat?.color ?? '#888'}22`, color: cat?.color }}
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
          onClick={() => setSetupOpen(false)}
        >
          {t('session.apply')}
        </Button>
      </Sheet>

      <Sheet open={!!adventure} onClose={closeAdventure} title={t('dashboard.yourAdventure')}>
        {adventure && (
          <div className="adv">
            <div className="adv__emoji" style={{ background: `${adventure.category.color}22` }}>
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
                <Button variant="secondary" icon="refresh" onClick={closeAdventure}>
                  {t('dashboard.again')}
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
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
