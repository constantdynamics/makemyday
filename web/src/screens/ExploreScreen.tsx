import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon, HomeIcon, UsersIcon, SettingsIcon } from '../components/icons';
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

export default function ExploreScreen() {
  const { t, language } = useLanguage();

  return (
    <div className="explore-screen">
      <header className="explore-header">
        <Link to="/dashboard" className="back-link">
          ← {t('common.back')}
        </Link>
        <h1>
          <SearchIcon size={28} color="white" className="inline-icon" />
          {' '}{t('dashboard.nav.explore')}
        </h1>
      </header>

      <main className="explore-main">
        <section className="search-section">
          <div className="search-box">
            <SearchIcon size={20} color="#6b7280" />
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
            <div className="activity-card">
              <div className="activity-icon">🏛️</div>
              <div className="activity-info">
                <h3>Rijksmuseum</h3>
                <p className="activity-distance">1.2 km</p>
                <p className="activity-category">{language === 'nl' ? 'Museum' : 'Museum'}</p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🌳</div>
              <div className="activity-info">
                <h3>Vondelpark</h3>
                <p className="activity-distance">0.8 km</p>
                <p className="activity-category">{language === 'nl' ? 'Park' : 'Park'}</p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🍽️</div>
              <div className="activity-info">
                <h3>De Kas</h3>
                <p className="activity-distance">2.5 km</p>
                <p className="activity-category">{language === 'nl' ? 'Restaurant' : 'Restaurant'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item">
          <HomeIcon size={24} />
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/explore" className="nav-item active">
          <SearchIcon size={24} />
          <span>{t('dashboard.nav.explore')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <UsersIcon size={24} />
          <span>{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <SettingsIcon size={24} />
          <span>{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
