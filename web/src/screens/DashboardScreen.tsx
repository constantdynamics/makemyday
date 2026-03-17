import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon, DiceIcon, SearchIcon, TrophyIcon, UsersIcon, SettingsIcon, CheckIcon, ChartIcon, FireIcon } from '../components/icons';
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
        <div className="dashboard-header-inner">
          <Link to="/" className="home-link">
            <div className="header-logo">
              <TargetIcon size={28} color="white" />
            </div>
            <h1>{t('welcome.title')}</h1>
          </Link>
        </div>
        <div className="header-wave" />
      </header>

      <main className="dashboard-main">
        <section className="greeting-section">
          <h2>{t('dashboard.greeting')}! 👋</h2>
          <p>{t('dashboard.subtitle')}</p>
        </section>

        <section className="spin-section">
          <div className="spin-card">
            <div className="spin-card-glow" />
            <h3>{t('dashboard.spinWheel')}</h3>
            {currentActivity && !spinning && (
              <div className="activity-result">
                <p className="activity-label">
                  {language === 'nl' ? 'Je volgende avontuur' : 'Your next adventure'}
                </p>
                <p className="activity-name">{currentActivity}</p>
              </div>
            )}
            <button
              className={`spin-button ${spinning ? 'spinning' : ''}`}
              onClick={handleSpin}
              disabled={spinning}
            >
              <DiceIcon size={24} className="spin-icon" />
              {spinning
                ? (language === 'nl' ? 'Aan het draaien...' : 'Spinning...')
                : t('dashboard.spinButton')}
            </button>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-green">
                <CheckIcon size={18} color="#10b981" />
              </div>
              <span className="stat-number">0</span>
              <span className="stat-label">{t('dashboard.stats.completed')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-orange">
                <FireIcon size={18} color="#f59e0b" />
              </div>
              <span className="stat-number">0</span>
              <span className="stat-label">{t('dashboard.stats.streak')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-purple">
                <ChartIcon size={18} color="#8b5cf6" />
              </div>
              <span className="stat-number">0</span>
              <span className="stat-label">{t('dashboard.stats.points')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-blue">
                <TrophyIcon size={18} color="#6366f1" />
              </div>
              <span className="stat-number">1</span>
              <span className="stat-label">{t('dashboard.stats.level')}</span>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h3>{t('dashboard.quickActions.title')}</h3>
          <div className="action-grid">
            <Link to="/explore" className="action-card action-card-green">
              <SearchIcon size={32} color="#10b981" />
              <h4>{t('dashboard.quickActions.explore')}</h4>
            </Link>
            <Link to="/challenges" className="action-card action-card-amber">
              <TargetIcon size={32} color="#f59e0b" />
              <h4>{t('dashboard.quickActions.challenges')}</h4>
            </Link>
            <Link to="/community" className="action-card action-card-purple">
              <UsersIcon size={32} color="#8b5cf6" />
              <h4>{t('community.title')}</h4>
            </Link>
            <Link to="/settings" className="action-card action-card-slate">
              <SettingsIcon size={32} color="#64748b" />
              <h4>{t('settings.title')}</h4>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
