import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon, DiceIcon, SearchIcon, TrophyIcon, UsersIcon, SettingsIcon, CheckIcon, ChartIcon, FireIcon, HomeIcon } from '../components/icons';
import './DashboardScreen.css';

const activities = {
  nl: [
    'Bezoek een lokaal museum',
    'Probeer een nieuw restaurant',
    'Maak een wandeling in het park',
    'Ga naar de bioscoop',
    'Bezoek een kunstgalerie',
    'Probeer een nieuwe koffiezaak',
    'Ga naar de markt',
    'Bezoek een boekwinkel',
    'Maak een fietstocht',
    'Ontdek een nieuwe wijk',
    'Bezoek een historische plek',
    'Ga picknicken',
    'Bezoek een straatfestival',
    'Probeer een escape room',
    'Ga naar een concert'
  ],
  en: [
    'Visit a local museum',
    'Try a new restaurant',
    'Take a walk in the park',
    'Go to the cinema',
    'Visit an art gallery',
    'Try a new coffee shop',
    'Go to the market',
    'Visit a bookstore',
    'Go for a bike ride',
    'Discover a new neighborhood',
    'Visit a historical site',
    'Have a picnic',
    'Attend a street festival',
    'Try an escape room',
    'Go to a concert'
  ]
};

export default function DashboardScreen() {
  const { t, language } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);

  const handleSpin = () => {
    setSpinning(true);
    setCurrentActivity(null);

    // Simulate spinning animation
    setTimeout(() => {
      const activityList = activities[language];
      const randomIndex = Math.floor(Math.random() * activityList.length);
      setCurrentActivity(activityList[randomIndex]);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Link to="/" className="home-link">
          <h1>
            <TargetIcon size={32} color="white" className="inline-icon" />
            {' '}{t('welcome.title')}
          </h1>
        </Link>
      </header>

      <main className="dashboard-main">
        <section className="greeting-section">
          <h2>{t('dashboard.greeting')}!</h2>
          <p>{t('dashboard.subtitle')}</p>
        </section>

        <section className="spin-section">
          <div className="spin-card">
            <h3>{t('dashboard.spinWheel')}</h3>
            {currentActivity && !spinning && (
              <div className="activity-result">
                <p className="activity-label">{language === 'nl' ? 'Je volgende avontuur:' : 'Your next adventure:'}</p>
                <p className="activity-name">{currentActivity}</p>
              </div>
            )}
            <button
              className={`spin-button ${spinning ? 'spinning' : ''}`}
              onClick={handleSpin}
              disabled={spinning}
            >
              <DiceIcon size={28} className="spin-icon" />
              {spinning ? (language === 'nl' ? 'Aan het draaien...' : 'Spinning...') : t('dashboard.spinButton')}
            </button>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <CheckIcon size={20} className="stat-icon" />
                <span className="stat-label">{t('dashboard.stats.completed')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.activities')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <FireIcon size={20} className="stat-icon" />
                <span className="stat-label">{t('dashboard.stats.streak')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.days')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <ChartIcon size={20} className="stat-icon" />
                <span className="stat-label">{t('dashboard.stats.points')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.earned')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <TrophyIcon size={20} className="stat-icon" />
                <span className="stat-label">{t('dashboard.stats.level')}</span>
              </div>
              <span className="stat-number">1</span>
              <span className="stat-sublabel">{t('dashboard.stats.adventurer')}</span>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h3>{t('dashboard.quickActions.title')}</h3>
          <div className="action-grid">
            <div className="action-card">
              <SearchIcon size={48} className="action-icon" />
              <h4>{t('dashboard.quickActions.explore')}</h4>
            </div>

            <div className="action-card">
              <TargetIcon size={48} className="action-icon" />
              <h4>{t('dashboard.quickActions.challenges')}</h4>
            </div>

            <Link to="/community" className="action-card">
              <UsersIcon size={48} className="action-icon" />
              <h4>{t('community.title')}</h4>
            </Link>

            <Link to="/settings" className="action-card">
              <SettingsIcon size={48} className="action-icon" />
              <h4>{t('settings.title')}</h4>
            </Link>
          </div>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item active">
          <HomeIcon size={24} />
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/dashboard" className="nav-item">
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
