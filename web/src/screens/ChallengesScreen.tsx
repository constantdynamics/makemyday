import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon, TrophyIcon, CheckIcon, HomeIcon, SearchIcon, UsersIcon, SettingsIcon } from '../components/icons';
import './ChallengesScreen.css';

const challenges = {
  nl: [
    { id: 1, title: 'Museum Marathon', description: 'Bezoek 5 verschillende musea', progress: 2, total: 5, points: 100 },
    { id: 2, title: 'Eet Lokaal', description: 'Probeer 10 lokale restaurants', progress: 7, total: 10, points: 150 },
    { id: 3, title: 'Groen Avontuur', description: 'Bezoek alle parken in de stad', progress: 3, total: 8, points: 80 },
    { id: 4, title: 'Cultuur Kenner', description: 'Ga naar 3 voorstellingen', progress: 1, total: 3, points: 60 },
  ],
  en: [
    { id: 1, title: 'Museum Marathon', description: 'Visit 5 different museums', progress: 2, total: 5, points: 100 },
    { id: 2, title: 'Eat Local', description: 'Try 10 local restaurants', progress: 7, total: 10, points: 150 },
    { id: 3, title: 'Green Adventure', description: 'Visit all parks in the city', progress: 3, total: 8, points: 80 },
    { id: 4, title: 'Culture Connoisseur', description: 'Attend 3 shows', progress: 1, total: 3, points: 60 },
  ],
};

export default function ChallengesScreen() {
  const { t, language } = useLanguage();
  const currentChallenges = challenges[language];

  return (
    <div className="challenges-screen">
      <header className="challenges-header">
        <Link to="/dashboard" className="back-link">
          ← {t('common.back')}
        </Link>
        <h1>
          <TargetIcon size={28} color="white" className="inline-icon" />
          {' '}{t('dashboard.quickActions.challenges')}
        </h1>
      </header>

      <main className="challenges-main">
        <section className="stats-overview">
          <div className="stat-box">
            <TrophyIcon size={32} color="#f59e0b" />
            <div>
              <p className="stat-value">390</p>
              <p className="stat-label">{language === 'nl' ? 'Punten' : 'Points'}</p>
            </div>
          </div>
          <div className="stat-box">
            <CheckIcon size={32} color="#10b981" />
            <div>
              <p className="stat-value">13</p>
              <p className="stat-label">{language === 'nl' ? 'Voltooid' : 'Completed'}</p>
            </div>
          </div>
        </section>

        <section className="challenges-section">
          <h2>{language === 'nl' ? 'Actieve Uitdagingen' : 'Active Challenges'}</h2>
          <div className="challenges-list">
            {currentChallenges.map((challenge) => (
              <div key={challenge.id} className="challenge-card">
                <div className="challenge-header">
                  <h3>{challenge.title}</h3>
                  <span className="challenge-points">+{challenge.points} {language === 'nl' ? 'pts' : 'pts'}</span>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="achievements-section">
          <h2>{language === 'nl' ? 'Behaalde Prestaties' : 'Achievements'}</h2>
          <div className="achievements-grid">
            <div className="achievement-badge">
              <span className="badge-icon">🏆</span>
              <p className="badge-name">{language === 'nl' ? 'Eerste Stappen' : 'First Steps'}</p>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">🎯</span>
              <p className="badge-name">{language === 'nl' ? 'Avonturier' : 'Adventurer'}</p>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">⭐</span>
              <p className="badge-name">{language === 'nl' ? 'Ster Speler' : 'Star Player'}</p>
            </div>
            <div className="achievement-badge locked">
              <span className="badge-icon">🔒</span>
              <p className="badge-name">{language === 'nl' ? 'Vergrendeld' : 'Locked'}</p>
            </div>
          </div>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item">
          <HomeIcon size={24} />
          <span>{t('dashboard.nav.home')}</span>
        </Link>
        <Link to="/explore" className="nav-item">
          <SearchIcon size={24} />
          <span>{t('dashboard.nav.explore')}</span>
        </Link>
        <Link to="/community" className="nav-item">
          <UsersIcon size={24} />
          <span>{t('dashboard.nav.community')}</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <SettingsIcon size={24} />
          <span>{t('settings.title')}</span>
        </Link>
      </nav>
    </div>
  );
}
