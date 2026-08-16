import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from './BottomNav';
import { Spinner } from '../ui/primitives';
import { hasOnboarded } from '../../lib/onboarding';

/**
 * App layout: scrollable content + persistent bottom nav.
 *
 * There is no login gate. An account syncs your progress across devices, but it
 * is never a condition for using the app — anyone who lands on `/app` without
 * one is simply switched into guest mode, whose progress lives on the device.
 */
export function AppShell() {
  const { session, isGuest, loading, continueAsGuest } = useAuth();

  useEffect(() => {
    if (!loading && !session && !isGuest) continueAsGuest();
  }, [loading, session, isGuest, continueAsGuest]);

  if (!session && !isGuest) {
    return (
      <div className="screen-center">
        <Spinner size={34} />
      </div>
    );
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
