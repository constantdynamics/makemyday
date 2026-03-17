import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon } from '../components/icons';
import './AuthScreen.css';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('common.error'));
      return;
    }

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
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('auth.register.name')}</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.register.email')}</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.register.password')}</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                {t('common.loading')}
              </span>
            ) : t('auth.register.registerButton')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.signIn')}</Link></p>
          <p className="terms-text">
            {t('auth.register.terms')} <a href="#">{t('auth.register.termsLink')}</a> {t('auth.register.and')} <a href="#">{t('auth.register.privacyLink')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
