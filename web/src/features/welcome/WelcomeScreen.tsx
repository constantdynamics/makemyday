import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';

const FEATURES = [
  { icon: 'map-pin', color: 'var(--green-500)', t: 'f1t', d: 'f1d' },
  { icon: 'dice', color: 'var(--brand-500)', t: 'f2t', d: 'f2d' },
  { icon: 'trophy', color: 'var(--amber-500)', t: 'f3t', d: 'f3d' },
  { icon: 'users', color: 'var(--pink-500)', t: 'f4t', d: 'f4d' },
];

export default function WelcomeScreen() {
  const { t, lang, setLang } = useI18n();
  const { session, isGuest, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session || isGuest) navigate('/app', { replace: true });
  }, [session, isGuest, navigate]);

  const guest = () => {
    continueAsGuest();
    navigate('/app');
  };

  return (
    <div className="welcome">
      <button
        className="welcome__lang"
        onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
        aria-label="language"
      >
        <Icon name="globe" size={16} /> {lang.toUpperCase()}
      </button>

      <div className="welcome__hero">
        <div className="welcome__logo">
          <Icon name="compass" size={40} color="#fff" />
        </div>
        <h1 className="welcome__title">Make My Day</h1>
        <p className="welcome__tagline">{t('welcome.tagline')}</p>
        <p className="welcome__sub">{t('welcome.subtitle')}</p>
      </div>

      <div className="welcome__features">
        {FEATURES.map((f) => (
          <div className="welcome__feature" key={f.t}>
            <span
              className="welcome__feature-icon"
              style={{
                background: `color-mix(in srgb, ${f.color} 14%, transparent)`,
                color: f.color,
              }}
            >
              <Icon name={f.icon} size={22} />
            </span>
            <div>
              <h3>{t(`welcome.${f.t}`)}</h3>
              <p>{t(`welcome.${f.d}`)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="welcome__cta">
        <Button
          size="lg"
          block
          onClick={() => navigate('/auth?mode=register')}
          iconRight="chevron-right"
        >
          {t('welcome.start')}
        </Button>
        <Button size="lg" block variant="secondary" icon="compass" onClick={guest}>
          {t('welcome.guest')}
        </Button>
        <button className="welcome__login" onClick={() => navigate('/auth?mode=login')}>
          {t('welcome.login')}
        </button>
      </div>
    </div>
  );
}
