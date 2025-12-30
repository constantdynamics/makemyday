import { Link } from 'react-router-dom';
import './DashboardScreen.css';

export default function DashboardScreen() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎯 Make My Day</h1>
        <div className="header-actions">
          <Link to="/premium" className="premium-badge">⭐ Go Premium</Link>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="spin-section">
          <div className="spin-card">
            <h2>Ready for an Adventure?</h2>
            <p>Spin the wheel to discover something new!</p>
            <button className="spin-button">
              <span className="spin-icon">🎲</span>
              Spin the Wheel
            </button>
          </div>
        </section>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <Link to="/community" className="action-card">
              <span className="action-icon">👥</span>
              <h4>Community</h4>
              <p>See what others are doing</p>
            </Link>

            <Link to="/premium" className="action-card">
              <span className="action-icon">⭐</span>
              <h4>Premium</h4>
              <p>Unlock exclusive features</p>
            </Link>

            <div className="action-card">
              <span className="action-icon">📍</span>
              <h4>Nearby</h4>
              <p>Explore your area</p>
            </div>

            <div className="action-card">
              <span className="action-icon">🏆</span>
              <h4>Challenges</h4>
              <p>Complete fun tasks</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Adventures</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Challenges</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0 km</span>
              <span className="stat-label">Distance</span>
            </div>
          </div>
        </section>
      </main>

      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item active">
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <Link to="/community" className="nav-item">
          <span>👥</span>
          <span>Community</span>
        </Link>
        <Link to="/premium" className="nav-item">
          <span>⭐</span>
          <span>Premium</span>
        </Link>
        <Link to="/" className="nav-item">
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
