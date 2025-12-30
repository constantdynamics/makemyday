import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './WelcomeScreen.css';

export default function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo">
          <span className="logo-emoji">🎯</span>
          <h1>{t('welcome.title')}</h1>
        </div>

        <p className="tagline">
          {t('welcome.subtitle')}
        </p>

        <p className="description">
          {t('welcome.description')}
        </p>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <h3>{t('welcome.features.discover.title')}</h3>
            <p>{t('welcome.features.discover.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">🎲</span>
            <h3>{t('welcome.features.spin.title')}</h3>
            <p>{t('welcome.features.spin.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>{t('welcome.features.track.title')}</h3>
            <p>{t('welcome.features.track.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">👥</span>
            <h3>{t('welcome.features.community.title')}</h3>
            <p>{t('welcome.features.community.description')}</p>
          </div>
        </div>

        <div className="cta-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            {t('welcome.tryGuest')}
          </Link>
          <Link to="/register" className="btn btn-secondary">
            {t('welcome.getStarted')}
          </Link>
          <Link to="/login" className="btn btn-link">
            {t('welcome.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
