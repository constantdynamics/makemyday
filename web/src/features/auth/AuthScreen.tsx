import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';

export default function AuthScreen() {
  const { t } = useI18n();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'login' ? 'login' : 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const setMode = (m: 'login' | 'register') => setParams({ mode: m });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'register') {
        const { needsConfirm } = await signUp(email.trim(), password, name.trim());
        if (needsConfirm) {
          show(t('auth.checkEmail'), 'info');
          setMode('login');
          return;
        }
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/app', { replace: true });
    } catch (err) {
      show((err as Error).message || t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const guest = () => {
    continueAsGuest();
    navigate('/app');
  };

  return (
    <div className="auth">
      <button className="auth__back" onClick={() => navigate('/')} aria-label="back">
        <Icon name="chevron-left" size={22} />
      </button>

      <div className="auth__head">
        <div className="auth__logo">
          <Icon name="compass" size={28} color="#fff" />
        </div>
        <h1>{mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
        <p>{mode === 'login' ? t('auth.loginSub') : t('auth.registerSub')}</p>
      </div>

      <form className="auth__form" onSubmit={submit}>
        {mode === 'register' && (
          <label className="field">
            <span>{t('auth.name')}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Alex"
            />
          </label>
        )}
        <label className="field">
          <span>{t('auth.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="jij@email.com"
          />
        </label>
        <label className="field">
          <span>{t('auth.password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </label>

        <Button type="submit" size="lg" block loading={busy}>
          {mode === 'login' ? t('auth.login') : t('auth.register')}
        </Button>
      </form>

      <p className="auth__toggle">
        {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
        </button>
      </p>

      <div className="auth__divider">
        <span>{t('auth.orGuest')}</span>
      </div>
      <Button variant="ghost" block icon="compass" onClick={guest}>
        {t('welcome.guest')}
      </Button>
    </div>
  );
}
