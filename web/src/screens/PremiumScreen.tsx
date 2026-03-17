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
} from '../components/icons';
import './PremiumScreen.css';

export default function PremiumScreen() {
  const { t, language } = useLanguage();

  const featureDescriptions = {
    nl: {
      unlimited: 'Onbeperkt draaien aan het rad',
      themed: 'Cultureel, Culinair, Kunst, Natuur & meer',
      advanced: 'Gedetailleerde inzichten in je avonturen',
      priority: 'Snellere hulp met toegewijde support',
      offline: 'Gebruik de app zonder internetverbinding',
      custom: 'Maak je eigen uitdagingen en doelen',
    },
    en: {
      unlimited: 'Unlimited spins of the activity wheel',
      themed: 'Cultural, Culinary, Art, Nature & more',
      advanced: 'Detailed insights into your adventures',
      priority: 'Faster help with dedicated support',
      offline: 'Use the app without internet connection',
      custom: 'Create your own challenges and goals',
    },
  };

  const descriptions = featureDescriptions[language];

  return (
    <div className="premium-screen">
      <header className="premium-header">
        <Link to="/dashboard" className="screen-back-link">← {t('common.back')}</Link>
        <h1>
          <StarIcon size={24} color="white" className="inline-icon" />
          {' '}Premium
        </h1>
      </header>
      <div className="screen-wave screen-wave-amber" />

      <main className="premium-main">
        <section className="premium-hero">
          <div className="premium-hero-badge">⭐</div>
          <h2>{t('premium.title')}</h2>
          <p>{t('premium.subtitle')}</p>
        </section>

        <section className="pricing">
          <div className="price-card featured">
            <div className="price-badge">{t('premium.save')}</div>
            <h3>{t('premium.yearly')}</h3>
            <div className="price-amount">{t('premium.yearlyPrice')}<span>{t('premium.perYear')}</span></div>
            <p className="price-savings">{t('premium.save')}</p>
            <ul className="price-features">
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.unlimited')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.themed')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.advanced')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.priority')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.offline')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.custom')}</li>
            </ul>
            <button className="price-cta price-cta-primary">{t('premium.startTrial')}</button>
          </div>

          <div className="price-card">
            <h3>{t('premium.monthly')}</h3>
            <div className="price-amount">{t('premium.monthlyPrice')}<span>{t('premium.perMonth')}</span></div>
            <p className="price-savings">&nbsp;</p>
            <ul className="price-features">
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.unlimited')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.themed')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.advanced')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.priority')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.offline')}</li>
              <li><CheckIcon size={16} color="#10b981" /> {t('premium.features.custom')}</li>
            </ul>
            <button className="price-cta price-cta-secondary">{t('premium.choosePlan')}</button>
          </div>
        </section>

        <section className="premium-features-section">
          <h3>{t('premium.features.title')}</h3>
          <div className="premium-features-grid">
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-indigo">
                <DiceIcon size={24} color="#6366f1" />
              </div>
              <h4>{t('premium.features.unlimited')}</h4>
              <p>{descriptions.unlimited}</p>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-purple">
                <PaletteIcon size={24} color="#8b5cf6" />
              </div>
              <h4>{t('premium.features.themed')}</h4>
              <p>{descriptions.themed}</p>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-pink">
                <ChartIcon size={24} color="#ec4899" />
              </div>
              <h4>{t('premium.features.advanced')}</h4>
              <p>{descriptions.advanced}</p>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-teal">
                <MessageIcon size={24} color="#14b8a6" />
              </div>
              <h4>{t('premium.features.priority')}</h4>
              <p>{descriptions.priority}</p>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-amber">
                <DeviceIcon size={24} color="#f59e0b" />
              </div>
              <h4>{t('premium.features.offline')}</h4>
              <p>{descriptions.offline}</p>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-icon-wrap pf-red">
                <TargetIcon size={24} color="#ef4444" />
              </div>
              <h4>{t('premium.features.custom')}</h4>
              <p>{descriptions.custom}</p>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <h3>{t('premium.testimonials.title')}</h3>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"{t('premium.testimonials.sarah.text')}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">👩</span>
                <span>- {t('premium.testimonials.sarah.author')}</span>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"{t('premium.testimonials.john.text')}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">👨</span>
                <span>- {t('premium.testimonials.john.author')}</span>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"{t('premium.testimonials.emma.text')}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">👧</span>
                <span>- {t('premium.testimonials.emma.author')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="guarantee-section">
          <CheckIcon size={20} color="#10b981" />
          <p>{t('premium.guarantee')}</p>
        </section>
      </main>
    </div>
  );
}
