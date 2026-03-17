import { Link } from 'react-router-dom';
import { useLanguage, Language } from '../contexts/LanguageContext';
import {
  GlobeIcon,
  CheckIcon,
  UserIcon,
  SettingsIcon,
  InfoIcon,
} from '../components/icons';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <Link to="/dashboard" className="settings-back-btn">←</Link>
        <h1>{t('settings.title')}</h1>
        <div className="settings-header-spacer" />
      </header>

      <div className="settings-content">
        <p className="settings-subtitle">{t('settings.subtitle')}</p>

        {/* Language Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">
              <GlobeIcon size={22} color="#6366f1" />
            </span>
            <div>
              <h2>{t('settings.language.title')}</h2>
              <p className="settings-section-description">{t('settings.language.description')}</p>
            </div>
          </div>
          <div className="language-options">
            <button
              className={`language-option ${language === 'nl' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('nl')}
            >
              <span className="language-flag">🇳🇱</span>
              <span className="language-name">{t('settings.language.dutch')}</span>
              {language === 'nl' && <span className="language-check"><CheckIcon size={18} color="#10b981" /></span>}
            </button>
            <button
              className={`language-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="language-flag">🇬🇧</span>
              <span className="language-name">{t('settings.language.english')}</span>
              {language === 'en' && <span className="language-check"><CheckIcon size={18} color="#10b981" /></span>}
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">
              <UserIcon size={22} color="#6366f1" />
            </span>
            <h2>{t('settings.account.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-list-item">
              <span>{t('settings.account.profile')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.account.email')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.account.password')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.account.privacy')}</span>
              <span className="settings-arrow">→</span>
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">
              <SettingsIcon size={22} color="#6366f1" />
            </span>
            <h2>{t('settings.preferences.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-list-item">
              <span>{t('settings.preferences.notifications')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.preferences.theme')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.preferences.location')}</span>
              <span className="settings-arrow">→</span>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">
              <InfoIcon size={22} color="#6366f1" />
            </span>
            <h2>{t('settings.about.title')}</h2>
          </div>
          <div className="settings-list">
            <button className="settings-list-item">
              <span>{t('settings.about.version')}</span>
              <span className="settings-version">1.0.0</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.about.terms')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.about.privacy')}</span>
              <span className="settings-arrow">→</span>
            </button>
            <button className="settings-list-item">
              <span>{t('settings.about.help')}</span>
              <span className="settings-arrow">→</span>
            </button>
          </div>
        </section>

        <button className="settings-logout-btn">
          {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}
