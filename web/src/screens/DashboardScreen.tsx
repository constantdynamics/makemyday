import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './DashboardScreen.css';

export default function DashboardScreen() {
  const { t } = useLanguage();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎯 {t('welcome.title')}</h1>
        <div className="header-actions">
          <Link to="/premium" className="premium-badge">⭐ Premium</Link>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="greeting-section">
          <h2>{t('dashboard.greeting')}!</h2>
          <p>{t('dashboard.subtitle')}</p>
        </section>

        <section className="spin-section">
          <div className="spin-card">
            <h3>{t('dashboard.spinWheel')}</h3>
            <button className="spin-button">
              <span className="spin-icon">🎲</span>
              {t('dashboard.spinButton')}
            </button>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">✅</span>
                <span className="stat-label">{t('dashboard.stats.completed')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.activities')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🔥</span>
                <span className="stat-label">{t('dashboard.stats.streak')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.days')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">⭐</span>
                <span className="stat-label">{t('dashboard.stats.points')}</span>
              </div>
              <span className="stat-number">0</span>
              <span className="stat-sublabel">{t('dashboard.stats.earned')}</span>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🏆</span>
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
              <span className="action-icon">🔍</span>
              <h4>{t('dashboard.quickActions.explore')}</h4>
            </div>

            <div className="action-card">
              <span className="action-icon">🎯</span>
              <h4>{t('dashboard.quickActions.challenges')}</h4>
            </div>

            <Link to="/premium" className="action-card">
              <span className="action-icon">⭐</span>
              <h4>{t('dashboard.quickActions.premium')}</h4>
            </Link>

            <Link to="/community" className="action-card">
              <span className="action-icon">👥</span>
              <h4>{t('community.title')}</h4>
            </Link>
          </div>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item active">
          <span>🏠</span>
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <span>👥</span>
          <span>{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/premium" className="nav-item">
          <span>⭐</span>
          <span>Premium</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <span>⚙️</span>
          <span>{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
