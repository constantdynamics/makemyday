import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon, HeartIcon, MessageIcon, ShareIcon, MapPinIcon } from '../components/icons';
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
        <Link to="/dashboard" className="screen-back-link">← {t('common.back')}</Link>
        <h1>
          <UsersIcon size={24} color="white" className="inline-icon" />
          {' '}{t('community.title')}
        </h1>
      </header>
      <div className="screen-wave screen-wave-purple" />

      <main className="community-main">
        <div className="community-tabs">
          <button className="community-tab active">{t('community.recent')}</button>
          <button className="community-tab">{t('community.trending')}</button>
          <button className="community-tab">{t('community.following')}</button>
        </div>

        <div className="create-post">
          <div className="create-post-avatar">✏️</div>
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
                      <MapPinIcon size={12} color="#9ca3af" />
                      {post.activity} · {post.location}
                    </div>
                  </div>
                </div>
                <div className="post-time">{language === 'nl' ? post.timeNL : post.time}</div>
              </div>

              <div className="post-content">
                <p>{language === 'nl' ? post.captionNL : post.caption}</p>
              </div>

              <div className="post-actions">
                <button className="post-action-btn">
                  <HeartIcon size={16} />
                  <span>{post.likes}</span>
                </button>
                <button className="post-action-btn">
                  <MessageIcon size={16} />
                  <span>{post.comments}</span>
                </button>
                <button className="post-action-btn">
                  <ShareIcon size={16} />
                  <span>{t('community.share')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
