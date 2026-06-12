import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from './BottomNav';
import { Spinner } from '../ui/primitives';
import { hasOnboarded } from '../../lib/onboarding';

/** Authenticated/guest layout: scrollable content + persistent bottom nav. */
export function AppShell() {
  const { session, isGuest, loading } = useAuth();
  const location = useLocation();

  if (loading && !session && !isGuest) {
    return (
      <div className="screen-center">
        <Spinner size={34} />
      </div>
    );
  }

  if (!session && !isGuest) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // First visit: walk through onboarding before landing in the app.
  if (!hasOnboarded()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="app-shell">
      <main className="app-shell__content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
