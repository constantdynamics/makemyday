import { Link } from 'react-router-dom';
import './WelcomeScreen.css';

export default function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo">
          <span className="logo-emoji">🎯</span>
          <h1>Make My Day</h1>
        </div>

        <p className="tagline">
          Your personal adventure companion
        </p>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🎲</span>
            <h3>Spin the Wheel</h3>
            <p>Discover random activities near you</p>
          </div>

          <div className="feature">
            <span className="feature-icon">🗺️</span>
            <h3>Explore Nearby</h3>
            <p>Find interesting places within your range</p>
          </div>

          <div className="feature">
            <span className="feature-icon">🏆</span>
            <h3>Complete Challenges</h3>
            <p>Earn points and unlock achievements</p>
          </div>

          <div className="feature">
            <span className="feature-icon">👥</span>
            <h3>Share Adventures</h3>
            <p>Connect with the community</p>
          </div>
        </div>

        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>

        <div className="pwa-benefits">
          <p>💡 <strong>Tip:</strong> Install our app for offline access and push notifications!</p>
        </div>
      </div>
    </div>
  );
}
