import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { TargetIcon, TrophyIcon, CheckIcon } from '../components/icons';
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

const achievements = {
  nl: [
    { icon: '🏆', name: 'Eerste Stappen', unlocked: true },
    { icon: '🎯', name: 'Avonturier', unlocked: true },
    { icon: '⭐', name: 'Ster Speler', unlocked: true },
    { icon: '🔒', name: 'Vergrendeld', unlocked: false },
  ],
  en: [
    { icon: '🏆', name: 'First Steps', unlocked: true },
    { icon: '🎯', name: 'Adventurer', unlocked: true },
    { icon: '⭐', name: 'Star Player', unlocked: true },
    { icon: '🔒', name: 'Locked', unlocked: false },
  ],
};

export default function ChallengesScreen() {
  const { t, language } = useLanguage();
  const currentChallenges = challenges[language];
  const currentAchievements = achievements[language];

  return (
    <div className="challenges-screen">
      <header className="challenges-header">
        <Link to="/dashboard" className="screen-back-link">
          ← {t('common.back')}
        </Link>
        <h1>
          <TargetIcon size={24} color="white" className="inline-icon" />
          {' '}{t('dashboard.quickActions.challenges')}
        </h1>
      </header>
      <div className="screen-wave screen-wave-amber" />

      <main className="challenges-main">
        <section className="stats-overview">
          <div className="challenge-stat-box">
            <div className="challenge-stat-icon-wrap amber">
              <TrophyIcon size={24} color="#f59e0b" />
            </div>
            <div>
              <p className="challenge-stat-value">390</p>
              <p className="challenge-stat-label">{language === 'nl' ? 'Punten' : 'Points'}</p>
            </div>
          </div>
          <div className="challenge-stat-box">
            <div className="challenge-stat-icon-wrap green">
              <CheckIcon size={24} color="#10b981" />
            </div>
            <div>
              <p className="challenge-stat-value">13</p>
              <p className="challenge-stat-label">{language === 'nl' ? 'Voltooid' : 'Completed'}</p>
            </div>
          </div>
        </section>

        <section className="challenges-section">
          <h2>{language === 'nl' ? 'Actieve Uitdagingen' : 'Active Challenges'}</h2>
          <div className="challenges-list">
            {currentChallenges.map((challenge) => {
              const percent = Math.round((challenge.progress / challenge.total) * 100);
              return (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-card-header">
                    <h3>{challenge.title}</h3>
                    <span className="challenge-points-badge">+{challenge.points} pts</span>
                  </div>
                  <p className="challenge-description">{challenge.description}</p>
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {challenge.progress}/{challenge.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="achievements-section">
          <h2>{language === 'nl' ? 'Behaalde Prestaties' : 'Achievements'}</h2>
          <div className="achievements-grid">
            {currentAchievements.map((achievement, i) => (
              <div key={i} className={`achievement-badge ${!achievement.unlocked ? 'locked' : ''}`}>
                <span className="badge-icon">{achievement.icon}</span>
                <p className="badge-name">{achievement.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
