import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PremiumScreen.css';

export default function PremiumScreen() {
  const { t } = useLanguage();

  return (
    <div className="premium-screen">
      <header className="premium-header">
        <Link to="/dashboard" className="back-link">← {t('common.back')}</Link>
        <h1>⭐ Premium</h1>
      </header>

      <main className="premium-main">
        <section className="premium-hero">
          <h2>{t('premium.title')}</h2>
          <p>{t('premium.subtitle')}</p>
        </section>

        <section className="pricing">
          <div className="price-card featured">
            <div className="badge">{t('premium.save')}</div>
            <h3>{t('premium.yearly')}</h3>
            <div className="price">{t('premium.yearlyPrice')}<span>{t('premium.perYear')}</span></div>
            <p className="savings">{t('premium.save')}</p>
            <ul className="features">
              <li>✅ {t('premium.features.unlimited')}</li>
              <li>✅ {t('premium.features.themed')}</li>
              <li>✅ {t('premium.features.advanced')}</li>
              <li>✅ {t('premium.features.priority')}</li>
              <li>✅ {t('premium.features.offline')}</li>
              <li>✅ {t('premium.features.custom')}</li>
            </ul>
            <button className="btn btn-primary">{t('premium.startTrial')}</button>
          </div>

          <div className="price-card">
            <h3>{t('premium.monthly')}</h3>
            <div className="price">{t('premium.monthlyPrice')}<span>{t('premium.perMonth')}</span></div>
            <p className="savings">&nbsp;</p>
            <ul className="features">
              <li>✅ {t('premium.features.unlimited')}</li>
              <li>✅ {t('premium.features.themed')}</li>
              <li>✅ {t('premium.features.advanced')}</li>
              <li>✅ {t('premium.features.priority')}</li>
              <li>✅ {t('premium.features.offline')}</li>
              <li>✅ {t('premium.features.custom')}</li>
            </ul>
            <button className="btn btn-secondary">{t('premium.choosePlan')}</button>
          </div>
        </section>

        <section className="premium-features">
          <h3>{t('premium.features.title')}</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🎲</span>
              <h4>{t('premium.features.unlimited')}</h4>
              <p>Onbeperkt draaien aan het rad</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <h4>{t('premium.features.themed')}</h4>
              <p>Cultureel, Culinair, Kunst, Natuur & Verborgen Pareltjes</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h4>{t('premium.features.advanced')}</h4>
              <p>Gedetailleerde inzichten in je avonturen</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <h4>{t('premium.features.priority')}</h4>
              <p>Snellere hulp met toegewijde support</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <h4>{t('premium.features.offline')}</h4>
              <p>Gebruik de app zonder internetverbinding</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <h4>{t('premium.features.custom')}</h4>
              <p>Maak je eigen uitdagingen en doelen</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h3>{t('premium.testimonials.title')}</h3>
          <div className="testimonial-grid">
            <div className="testimonial">
              <p>"{t('premium.testimonials.sarah.text')}"</p>
              <span>- {t('premium.testimonials.sarah.author')}</span>
            </div>
            <div className="testimonial">
              <p>"{t('premium.testimonials.john.text')}"</p>
              <span>- {t('premium.testimonials.john.author')}</span>
            </div>
            <div className="testimonial">
              <p>"{t('premium.testimonials.emma.text')}"</p>
              <span>- {t('premium.testimonials.emma.author')}</span>
            </div>
          </div>
        </section>

        <section className="guarantee">
          <p>✅ {t('premium.guarantee')}</p>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item">
          <span>🏠</span>
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <span>👥</span>
          <span>{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/premium" className="nav-item active">
          <span>⭐</span>
          <span>Premium</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <span>⚙️</span>
          <span>{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
