import { Link } from 'react-router-dom';
import './CommunityScreen.css';

const mockPosts = [
  {
    id: 1,
    user: 'Sarah M.',
    avatar: '👩',
    activity: 'Van Gogh Museum',
    location: 'Amsterdam',
    caption: 'Amazing art collection! The Sunflowers were breathtaking 🌻',
    likes: 24,
    comments: 5,
    time: '2h ago'
  },
  {
    id: 2,
    user: 'Mark V.',
    avatar: '👨',
    activity: 'Vondelpark',
    location: 'Amsterdam',
    caption: 'Perfect afternoon for a picnic! Found a hidden spot by the pond 🦆',
    likes: 18,
    comments: 3,
    time: '5h ago'
  },
  {
    id: 3,
    user: 'Emma L.',
    avatar: '👧',
    activity: 'Street Food Market',
    location: 'Rotterdam',
    caption: 'Best bitterballen I\'ve ever had! 🍺',
    likes: 31,
    comments: 7,
    time: '1d ago'
  }
];

export default function CommunityScreen() {
  return (
    <div className="community-screen">
      <header className="community-header">
        <Link to="/dashboard" className="back-link">← Back</Link>
        <h1>👥 Community</h1>
      </header>

      <main className="community-main">
        <div className="create-post">
          <button className="create-post-btn">
            <span>➕</span> Share Your Adventure
          </button>
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
                      📍 {post.activity} • {post.location}
                    </div>
                  </div>
                </div>
                <div className="post-time">{post.time}</div>
              </div>

              <div className="post-content">
                <p>{post.caption}</p>
              </div>

              <div className="post-actions">
                <button className="action-btn">
                  ❤️ {post.likes}
                </button>
                <button className="action-btn">
                  💬 {post.comments}
                </button>
                <button className="action-btn">
                  🔗 Share
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="community-empty-state" style={{ display: 'none' }}>
          <span className="empty-icon">👥</span>
          <h3>No Posts Yet</h3>
          <p>Be the first to share your adventure!</p>
          <button className="btn btn-primary">Create Post</button>
        </div>
      </main>
    </div>
  );
}
