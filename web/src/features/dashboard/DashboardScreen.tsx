import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import {
  useCatalog,
  activityTitle,
  activityDescription,
  categoryName,
} from '../../hooks/useCatalog';
import { useNearby } from '../../hooks/useNearby';
import { useCompletions } from '../../hooks/useCompletions';
import { SpinWheel } from '../../components/SpinWheel';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Card, Badge } from '../../components/ui/primitives';
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
  const { categories, activities, loading } = useCatalog();
  const { count, complete } = useCompletions();
  const { origin, pois, status, requestLocation } = useNearby(categories, 2500, 'all');

  const [spinning, setSpinning] = useState(false);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [completing, setCompleting] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (lang === 'nl') return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
    return h < 6 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
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
    const inCat = activities.filter((a) => a.category_id === cat.id);
    const pool = inCat.length ? inCat : activities;
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
    setAdventure(buildAdventure(cat));
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
      const prof = await complete({
        title: adventure.title,
        categoryId: adventure.category.id,
        source: adventure.source,
        lat: adventure.coords?.lat ?? null,
        lng: adventure.coords?.lng ?? null,
        placeName: adventure.placeName ?? null,
        points: 10 + adventure.category.sort_order,
      });
      show(t('toast.completed', { n: prof.xp - (profile?.xp ?? 0) }), 'success');
      setAdventure(null);
    } catch {
      show(t('common.error'), 'error');
    } finally {
      setCompleting(false);
    }
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
                <Card key={p.id} interactive className="poi-row" onClick={() => navigate('/app/explore')}>
                  <span className="poi-row__icon" style={{ background: `${cat?.color ?? '#888'}22`, color: cat?.color }}>
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

      <Sheet open={!!adventure} onClose={() => setAdventure(null)} title={t('dashboard.yourAdventure')}>
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
            <div className="adv__actions">
              <Button size="lg" block icon="check" loading={completing} onClick={accept}>
                {t('dashboard.accept')}
              </Button>
              <div className="adv__row">
                <Button variant="secondary" icon="refresh" onClick={() => setAdventure(null)}>
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
