import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  StarIcon,
  CheckIcon,
  DiceIcon,
  PaletteIcon,
  ChartIcon,
  MessageIcon,
  DeviceIcon,
  TargetIcon,
  HomeIcon,
  UsersIcon,
  SettingsIcon
} from '../components/icons';
import './PremiumScreen.css';

export default function PremiumScreen() {
  const { t } = useLanguage();

  return (
    <div className="premium-screen">
      <header className="premium-header">
        <Link to="/dashboard" className="back-link">← {t('common.back')}</Link>
        <h1>
          <StarIcon size={28} color="white" className="inline-icon" />
          {' '}Premium
        </h1>
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
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.unlimited')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.themed')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.advanced')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.priority')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.offline')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.custom')}</li>
            </ul>
            <button className="btn btn-primary">{t('premium.startTrial')}</button>
          </div>

          <div className="price-card">
            <h3>{t('premium.monthly')}</h3>
            <div className="price">{t('premium.monthlyPrice')}<span>{t('premium.perMonth')}</span></div>
            <p className="savings">&nbsp;</p>
            <ul className="features">
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.unlimited')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.themed')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.advanced')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.priority')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.offline')}</li>
              <li><CheckIcon size={16} color="#10b981" className="inline-icon" /> {t('premium.features.custom')}</li>
            </ul>
            <button className="btn btn-secondary">{t('premium.choosePlan')}</button>
          </div>
        </section>

        <section className="premium-features">
          <h3>{t('premium.features.title')}</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">
                <DiceIcon size={32} color="#6366f1" />
              </span>
              <h4>{t('premium.features.unlimited')}</h4>
              <p>Onbeperkt draaien aan het rad</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <PaletteIcon size={32} color="#8b5cf6" />
              </span>
              <h4>{t('premium.features.themed')}</h4>
              <p>Cultureel, Culinair, Kunst, Natuur & Verborgen Pareltjes</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <ChartIcon size={32} color="#ec4899" />
              </span>
              <h4>{t('premium.features.advanced')}</h4>
              <p>Gedetailleerde inzichten in je avonturen</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <MessageIcon size={32} color="#14b8a6" />
              </span>
              <h4>{t('premium.features.priority')}</h4>
              <p>Snellere hulp met toegewijde support</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <DeviceIcon size={32} color="#f59e0b" />
              </span>
              <h4>{t('premium.features.offline')}</h4>
              <p>Gebruik de app zonder internetverbinding</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <TargetIcon size={32} color="#ef4444" />
              </span>
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
          <p>
            <CheckIcon size={20} color="#10b981" className="inline-icon" />
            {' '}{t('premium.guarantee')}
          </p>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item">
          <HomeIcon size={24} />
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <UsersIcon size={24} />
          <span>{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/premium" className="nav-item active">
          <StarIcon size={24} />
          <span>Premium</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <SettingsIcon size={24} />
          <span>{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
