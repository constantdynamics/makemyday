import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/primitives';
import WelcomeScreen from './features/welcome/WelcomeScreen';

const AuthScreen = lazy(() => import('./features/auth/AuthScreen'));
const DashboardScreen = lazy(() => import('./features/dashboard/DashboardScreen'));
const ExploreScreen = lazy(() => import('./features/explore/ExploreScreen'));
const ChallengesScreen = lazy(() => import('./features/challenges/ChallengesScreen'));
const CommunityScreen = lazy(() => import('./features/community/CommunityScreen'));
const ProfileScreen = lazy(() => import('./features/profile/ProfileScreen'));
const SettingsScreen = lazy(() => import('./features/settings/SettingsScreen'));
const PremiumScreen = lazy(() => import('./features/premium/PremiumScreen'));

function Loading() {
  return (
    <div className="screen-center" style={{ minHeight: '100dvh' }}>
      <Spinner size={34} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter basename="/makemyday">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<WelcomeScreen />} />
                  <Route path="/auth" element={<AuthScreen />} />
                  <Route path="/premium" element={<PremiumScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                  <Route path="/app" element={<AppShell />}>
                    <Route index element={<DashboardScreen />} />
                    <Route path="explore" element={<ExploreScreen />} />
                    <Route path="challenges" element={<ChallengesScreen />} />
                    <Route path="community" element={<CommunityScreen />} />
                    <Route path="profile" element={<ProfileScreen />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
