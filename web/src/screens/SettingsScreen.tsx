import { Link } from 'react-router-dom';
import { useLanguage, Language } from '../contexts/LanguageContext';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <Link to="/dashboard" className="back-button">←</Link>
        <h1>{t('settings.title')}</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="settings-content">
        <p className="settings-subtitle">{t('settings.subtitle')}</p>

        {/* Language Section */}
        <section className="settings-section">
          <div className="section-header">
            <span className="section-icon">🌐</span>
            <div>
              <h2>{t('settings.language.title')}</h2>
              <p className="section-description">{t('settings.language.description')}</p>
            </div>
          </div>
          <div className="language-options">
            <button
              className={`language-option ${language === 'nl' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('nl')}
            >
              <span className="flag">🇳🇱</span>
              <span className="language-name">{t('settings.language.dutch')}</span>
              {language === 'nl' && <span className="checkmark">✓</span>}
            </button>
            <button
              className={`language-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="flag">🇬🇧</span>
              <span className="language-name">{t('settings.language.english')}</span>
              {language === 'en' && <span className="checkmark">✓</span>}
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="settings-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h2>{t('settings.account.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-item">
              <span>{t('settings.account.profile')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.account.email')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.account.password')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.account.privacy')}</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <div className="section-header">
            <span className="section-icon">⚙️</span>
            <h2>{t('settings.preferences.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-item">
              <span>{t('settings.preferences.notifications')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.preferences.theme')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.preferences.location')}</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="settings-section">
          <div className="section-header">
            <span className="section-icon">ℹ️</span>
            <h2>{t('settings.about.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-item">
              <span>{t('settings.about.version')}</span>
              <span className="version-text">1.0.0</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.about.terms')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.about.privacy')}</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-item">
              <span>{t('settings.about.help')}</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <button className="logout-button">
          {t('settings.logout')}
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-label">{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/premium" className="nav-item">
          <span className="nav-icon">⭐</span>
          <span className="nav-label">Premium</span>
        </Link>
        <Link to="/settings" className="nav-item active">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
