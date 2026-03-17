import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import BottomNav from './components/BottomNav';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ExploreScreen from './screens/ExploreScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import PremiumScreen from './screens/PremiumScreen';
import CommunityScreen from './screens/CommunityScreen';
import SettingsScreen from './screens/SettingsScreen';
import './App.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AUTH_ROUTES = ['/', '/login', '/register'];

function AppLayout() {
  const location = useLocation();
  const showNav = !AUTH_ROUTES.includes(location.pathname);

  return (
    <div className="app">
      <div className={`app-content ${showNav ? 'has-nav' : ''}`}>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/challenges" element={<ChallengesScreen />} />
          <Route path="/premium" element={<PremiumScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <LanguageProvider>
      <BrowserRouter basename="/makemyday">
        <AppLayout />

        {showInstallPrompt && (
          <div className="install-prompt">
            <div>
              <strong>Install Make My Day</strong>
              <p style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
                Install our app for the best experience!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowInstallPrompt(false)}>
                Later
              </button>
              <button onClick={handleInstallClick}>
                Install
              </button>
            </div>
          </div>
        )}
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
