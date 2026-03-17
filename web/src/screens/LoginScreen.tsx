import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon } from '../components/icons';
import './AuthScreen.css';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <Link to="/" className="auth-back-button">← {t('common.back')}</Link>

        <div className="auth-logo">
          <TargetIcon size={36} color="#6366f1" />
        </div>

        <div className="auth-header">
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.login.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.login.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </div>

          <a href="#" className="forgot-password">{t('auth.login.forgotPassword')}</a>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                {t('common.loading')}
              </span>
            ) : t('auth.login.loginButton')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{t('auth.login.noAccount')} <Link to="/register">{t('auth.login.signUp')}</Link></p>
        </div>
      </div>
    </div>
  );
}
