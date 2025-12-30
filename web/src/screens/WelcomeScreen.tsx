import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  TargetIcon,
  SearchIcon,
  DiceIcon,
  ChartIcon,
  UsersIcon
} from '../components/icons';
import './WelcomeScreen.css';

export default function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo">
          <span className="logo-emoji">
            <TargetIcon size={64} color="#6366f1" />
          </span>
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
            <span className="feature-icon">
              <SearchIcon size={40} color="#6366f1" />
            </span>
            <h3>{t('welcome.features.discover.title')}</h3>
            <p>{t('welcome.features.discover.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <DiceIcon size={40} color="#8b5cf6" />
            </span>
            <h3>{t('welcome.features.spin.title')}</h3>
            <p>{t('welcome.features.spin.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <ChartIcon size={40} color="#ec4899" />
            </span>
            <h3>{t('welcome.features.track.title')}</h3>
            <p>{t('welcome.features.track.description')}</p>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <UsersIcon size={40} color="#14b8a6" />
            </span>
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
