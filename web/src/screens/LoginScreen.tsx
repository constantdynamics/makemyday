import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './AuthScreen.css';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Login:', { email, password });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <Link to="/" className="back-button">← {t('common.back')}</Link>

        <div className="auth-header">
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
        </div>

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
            />
          </div>

          <a href="#" className="forgot-password">{t('auth.login.forgotPassword')}</a>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login.loginButton')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{t('auth.login.noAccount')} <Link to="/register">{t('auth.login.signUp')}</Link></p>
        </div>
      </div>
    </div>
  );
}
