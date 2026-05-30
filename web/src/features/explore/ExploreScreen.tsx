import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useI18n } from '../../i18n';
import { useCatalog, categoryName } from '../../hooks/useCatalog';
import { useNearby } from '../../hooks/useNearby';
import { Segmented, Card, EmptyState, Spinner } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import { directionsUrl, formatDistance, type LatLng } from '../../lib/geo';
import './explore.css';

const RADII = [1000, 2500, 5000, 10000];

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  map.setView([center.lat, center.lng]);
  return null;
}

export default function ExploreScreen() {
  const { t, lang } = useI18n();
  const { categories } = useCatalog();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [cat, setCat] = useState<string>('all');
  const [radius, setRadius] = useState(2500);
  const { origin, pois, status, requestLocation } = useNearby(categories, radius, cat);

  const catColor = (id: string) => categories.find((c) => c.id === id)?.color ?? '#6366f1';
  const catIcon = (id: string) => categories.find((c) => c.id === id)?.icon ?? 'map-pin';

  return (
    <div className="explore">
      <header className="screen-head">
        <h1>{t('explore.title')}</h1>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: t('explore.list'), icon: 'list' },
            { value: 'map', label: t('explore.map'), icon: 'map-pin' },
          ]}
        />
      </header>

      <div className="chips">
        <button className={`chip ${cat === 'all' ? 'is-active' : ''}`} onClick={() => setCat('all')}>
          {t('explore.all')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${cat === c.id ? 'is-active' : ''}`}
            style={cat === c.id ? { background: c.color, borderColor: c.color, color: '#fff' } : undefined}
            onClick={() => setCat(c.id)}
          >
            <Icon name={c.icon} size={15} /> {categoryName(c, lang)}
          </button>
        ))}
      </div>

      <div className="explore__radius">
        <span className="muted">{t('explore.radius')}</span>
        {RADII.map((r) => (
          <button key={r} className={`pill ${radius === r ? 'is-active' : ''}`} onClick={() => setRadius(r)}>
            {r / 1000} km
          </button>
        ))}
      </div>

      {!origin ? (
        <EmptyState
          icon="map-pin"
          title={t('dashboard.locationOff')}
          body={t('dashboard.usingCurated')}
          action={
            <Button icon="navigation" onClick={requestLocation} loading={status === 'locating'}>
              {t('dashboard.enableLocation')}
            </Button>
          }
        />
      ) : status === 'loading' ? (
        <div className="screen-center"><Spinner /></div>
      ) : pois.length === 0 ? (
        <EmptyState icon="search" title={t('explore.noResults')} />
      ) : view === 'list' ? (
        <>
          <p className="explore__count muted">{t('explore.spotsFound', { n: pois.length })}</p>
          <div className="explore__list">
            {pois.map((p) => (
              <Card key={p.id} className="poi-row">
                <span className="poi-row__icon" style={{ background: `${catColor(p.categoryId)}22`, color: catColor(p.categoryId) }}>
                  <Icon name={catIcon(p.categoryId)} size={18} />
                </span>
                <div className="poi-row__body">
                  <strong>{p.name}</strong>
                  <span className="muted">{p.kind.replace(/_/g, ' ')}</span>
                </div>
                <div className="poi-row__end">
                  <span className="poi-row__dist">{formatDistance(p.distance, lang)}</span>
                  <button
                    className="icon-btn"
                    aria-label="navigate"
                    onClick={() => window.open(directionsUrl({ lat: p.lat, lng: p.lng }, p.name), '_blank')}
                  >
                    <Icon name="navigation" size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="explore__map">
          <MapContainer center={[origin.lat, origin.lng]} zoom={14} scrollWheelZoom>
            <Recenter center={origin} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CircleMarker center={[origin.lat, origin.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#6366f1', fillOpacity: 1 }} />
            {pois.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={7}
                pathOptions={{ color: catColor(p.categoryId), fillColor: catColor(p.categoryId), fillOpacity: 0.85, weight: 2 }}
              >
                <Popup>
                  <strong>{p.name}</strong>
                  <br />
                  {formatDistance(p.distance, lang)}
                  <br />
                  <a href={directionsUrl({ lat: p.lat, lng: p.lng }, p.name)} target="_blank" rel="noreferrer">
                    {t('dashboard.navigate')} →
                  </a>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
