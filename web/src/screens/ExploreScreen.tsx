import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon } from '../components/icons';
import './ExploreScreen.css';

const categories = [
  { id: 'museums', iconEmoji: '🏛️', nlName: 'Musea', enName: 'Museums' },
  { id: 'restaurants', iconEmoji: '🍽️', nlName: 'Restaurants', enName: 'Restaurants' },
  { id: 'parks', iconEmoji: '🌳', nlName: 'Parken', enName: 'Parks' },
  { id: 'culture', iconEmoji: '🎭', nlName: 'Cultuur', enName: 'Culture' },
  { id: 'sports', iconEmoji: '⚽', nlName: 'Sport', enName: 'Sports' },
  { id: 'shopping', iconEmoji: '🛍️', nlName: 'Winkelen', enName: 'Shopping' },
  { id: 'nightlife', iconEmoji: '🌃', nlName: 'Uitgaan', enName: 'Nightlife' },
  { id: 'nature', iconEmoji: '🏞️', nlName: 'Natuur', enName: 'Nature' },
];

const nearbyPlaces = [
  { name: 'Rijksmuseum', distance: '1.2 km', category: 'Museum', icon: '🏛️' },
  { name: 'Vondelpark', distance: '0.8 km', category: 'Park', icon: '🌳' },
  { name: 'De Kas', distance: '2.5 km', category: 'Restaurant', icon: '🍽️' },
];

export default function ExploreScreen() {
  const { t, language } = useLanguage();

  return (
    <div className="explore-screen">
      <header className="explore-header">
        <Link to="/dashboard" className="screen-back-link">
          ← {t('common.back')}
        </Link>
        <h1>
          <SearchIcon size={24} color="white" className="inline-icon" />
          {' '}{t('dashboard.nav.explore')}
        </h1>
      </header>
      <div className="screen-wave screen-wave-green" />

      <main className="explore-main">
        <section className="search-section">
          <div className="search-box">
            <SearchIcon size={20} color="#9ca3af" />
            <input
              type="text"
              placeholder={language === 'nl' ? 'Zoek activiteiten...' : 'Search activities...'}
              className="search-input"
            />
          </div>
        </section>

        <section className="categories-section">
          <h2>{language === 'nl' ? 'Categorieën' : 'Categories'}</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <span className="category-icon">{category.iconEmoji}</span>
                <h3>{language === 'nl' ? category.nlName : category.enName}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="nearby-section">
          <h2>{language === 'nl' ? 'In de buurt' : 'Nearby'}</h2>
          <div className="nearby-list">
            {nearbyPlaces.map((place) => (
              <div key={place.name} className="place-card">
                <div className="place-icon">{place.icon}</div>
                <div className="place-info">
                  <h3>{place.name}</h3>
                  <div className="place-meta">
                    <span className="place-distance">{place.distance}</span>
                    <span className="place-dot">·</span>
                    <span className="place-category">{place.category}</span>
                  </div>
                </div>
                <span className="place-arrow">→</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
