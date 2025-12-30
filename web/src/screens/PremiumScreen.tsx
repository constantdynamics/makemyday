import { Link } from 'react-router-dom';
import './PremiumScreen.css';

export default function PremiumScreen() {
  return (
    <div className="premium-screen">
      <header className="premium-header">
        <Link to="/dashboard" className="back-link">← Back</Link>
        <h1>⭐ Premium</h1>
      </header>

      <main className="premium-main">
        <section className="premium-hero">
          <h2>Unlock the Full Experience</h2>
          <p>Get access to exclusive features and unlimited adventures</p>
        </section>

        <section className="pricing">
          <div className="price-card featured">
            <div className="badge">Most Popular</div>
            <h3>Yearly</h3>
            <div className="price">€12<span>/year</span></div>
            <p className="savings">Save 33%</p>
            <ul className="features">
              <li>✅ Unlimited spins</li>
              <li>✅ Daily discovery menu</li>
              <li>✅ Themed adventures</li>
              <li>✅ Vacation planner (2x/year)</li>
              <li>✅ Premium challenges</li>
              <li>✅ Priority support</li>
            </ul>
            <button className="btn btn-primary">Start 7-Day Free Trial</button>
          </div>

          <div className="price-card">
            <h3>Monthly</h3>
            <div className="price">€1.50<span>/month</span></div>
            <p className="savings">&nbsp;</p>
            <ul className="features">
              <li>✅ Unlimited spins</li>
              <li>✅ Daily discovery menu</li>
              <li>✅ Themed adventures</li>
              <li>✅ Vacation planner (2x/year)</li>
              <li>✅ Premium challenges</li>
              <li>✅ Priority support</li>
            </ul>
            <button className="btn btn-secondary">Start 7-Day Free Trial</button>
          </div>
        </section>

        <section className="premium-features">
          <h3>Premium Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🍽️</span>
              <h4>Daily Discovery Menu</h4>
              <p>3 personalized activity suggestions every day</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <h4>Themed Adventures</h4>
              <p>Curated tours: Historical, Culinary, Art, Nature & Hidden Gems</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✈️</span>
              <h4>Vacation Explorer</h4>
              <p>Plan trips with 20+ activity bucketlists (2x per year)</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h4>Advanced Stats</h4>
              <p>Detailed insights into your adventures and achievements</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔥</span>
              <h4>Exclusive Challenges</h4>
              <p>Access premium-only challenges and events</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <h4>Priority Support</h4>
              <p>Get help faster with dedicated support</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h3>What Our Users Say</h3>
          <div className="testimonial-grid">
            <div className="testimonial">
              <p>"The daily menu saves me so much time! I always know what to do."</p>
              <span>- Sarah, Amsterdam</span>
            </div>
            <div className="testimonial">
              <p>"Themed adventures helped me discover parts of my city I never knew existed!"</p>
              <span>- Mark, Rotterdam</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
