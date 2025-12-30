import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon, HomeIcon, SearchIcon, SettingsIcon, HeartIcon, MessageIcon, ShareIcon, MapPinIcon } from '../components/icons';
import './CommunityScreen.css';

const mockPosts = [
  {
    id: 1,
    user: 'Sarah M.',
    avatar: '👩',
    activity: 'Van Gogh Museum',
    location: 'Amsterdam',
    caption: 'Amazing art collection! The Sunflowers were breathtaking 🌻',
    captionNL: 'Geweldige kunstcollectie! De Zonnebloemen waren adembenemend 🌻',
    likes: 24,
    comments: 5,
    time: '2h ago',
    timeNL: '2u geleden'
  },
  {
    id: 2,
    user: 'Mark V.',
    avatar: '👨',
    activity: 'Vondelpark',
    location: 'Amsterdam',
    caption: 'Perfect afternoon for a picnic! Found a hidden spot by the pond 🦆',
    captionNL: 'Perfecte middag voor een picknick! Verstopt plekje bij de vijver gevonden 🦆',
    likes: 18,
    comments: 3,
    time: '5h ago',
    timeNL: '5u geleden'
  },
  {
    id: 3,
    user: 'Emma L.',
    avatar: '👧',
    activity: 'Street Food Market',
    location: 'Rotterdam',
    caption: 'Best bitterballen I\'ve ever had! 🍺',
    captionNL: 'Beste bitterballen die ik ooit heb gehad! 🍺',
    likes: 31,
    comments: 7,
    time: '1d ago',
    timeNL: '1d geleden'
  }
];

export default function CommunityScreen() {
  const { t, language } = useLanguage();

  return (
    <div className="community-screen">
      <header className="community-header">
        <Link to="/dashboard" className="back-link">← {t('common.back')}</Link>
        <h1>
          <UsersIcon size={28} color="white" className="inline-icon" />
          {' '}{t('community.title')}
        </h1>
      </header>

      <main className="community-main">
        <div className="tabs">
          <button className="tab active">{t('community.recent')}</button>
          <button className="tab">{t('community.trending')}</button>
          <button className="tab">{t('community.following')}</button>
        </div>

        <div className="create-post">
          <input
            type="text"
            placeholder={t('community.writePost')}
            className="create-post-input"
          />
        </div>

        <div className="feed">
          {mockPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-user">
                  <span className="user-avatar">{post.avatar}</span>
                  <div>
                    <div className="user-name">{post.user}</div>
                    <div className="post-activity">
                      <MapPinIcon size={14} className="inline-icon" color="#6b7280" />
                      {' '}{post.activity} • {post.location}
                    </div>
                  </div>
                </div>
                <div className="post-time">{language === 'nl' ? post.timeNL : post.time}</div>
              </div>

              <div className="post-content">
                <p>{language === 'nl' ? post.captionNL : post.caption}</p>
              </div>

              <div className="post-actions">
                <button className="action-btn">
                  <HeartIcon size={18} />
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn">
                  <MessageIcon size={18} />
                  <span>{post.comments}</span>
                </button>
                <button className="action-btn">
                  <ShareIcon size={18} />
                  <span>{t('community.share')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <Link to="/community" className="nav-item active">
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
