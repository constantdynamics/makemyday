import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n, type Lang } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Segmented } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import './settings.css';

export default function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const { pref, setPref } = useTheme();
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="settings">
      <header className="screen-head settings__head">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="back">
          <Icon name="chevron-left" size={22} />
        </button>
        <h1>{t('settings.title')}</h1>
      </header>

      {!user && (
        <Card className="settings__premium" onClick={() => navigate('/auth?mode=register')}>
          <span className="settings__premium-icon"><Icon name="user" size={22} /></span>
          <div>
            <strong>{t('auth.createAccount')}</strong>
            <p>{t('profile.guestSub')}</p>
          </div>
          <Icon name="chevron-right" size={20} />
        </Card>
      )}

      <Card className="settings__premium settings__premium--gold" onClick={() => navigate('/premium')}>
        <span className="settings__premium-icon"><Icon name="crown" size={22} /></span>
        <div>
          <strong>{t('settings.premium')}</strong>
          <p>{t('premium.subtitle')}</p>
        </div>
        <Icon name="chevron-right" size={20} />
      </Card>

      <section className="settings__group">
        <h2>{t('settings.appearance')}</h2>
        <Card className="settings__row settings__row--stack">
          <span className="settings__label"><Icon name="moon" size={18} /> {t('settings.theme')}</span>
          <Segmented
            value={pref}
            onChange={setPref}
            options={[
              { value: 'light', label: t('settings.light'), icon: 'sun' },
              { value: 'dark', label: t('settings.dark'), icon: 'moon' },
              { value: 'system', label: t('settings.system') },
            ]}
          />
        </Card>
        <Card className="settings__row settings__row--stack">
          <span className="settings__label"><Icon name="globe" size={18} /> {t('settings.language')}</span>
          <Segmented
            value={lang}
            onChange={(l: Lang) => setLang(l)}
            options={[
              { value: 'nl', label: t('settings.dutch') },
              { value: 'en', label: t('settings.english') },
            ]}
          />
        </Card>
      </section>

      {user && !isGuest && (
        <section className="settings__group">
          <h2>{t('settings.account')}</h2>
          <Card className="settings__row">
            <span className="settings__label"><Icon name="user" size={18} /> {user.email}</span>
          </Card>
          <Button variant="danger" block icon="logout" onClick={logout}>
            {t('settings.logout')}
          </Button>
        </section>
      )}

      <p className="settings__version">{t('settings.version')} 2.0.0</p>
    </div>
  );
}
