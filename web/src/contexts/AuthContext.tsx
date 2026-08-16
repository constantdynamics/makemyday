import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { STORAGE_PREFIX, SITE_URL } from '../lib/config';
import { loadGuestProfile, saveGuestProfile } from '../lib/localProgress';
import type { Profile } from '../types/db';

const GUEST_KEY = `${STORAGE_PREFIX}guest`;

interface AuthValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isGuest: boolean;
  loading: boolean;
  /** Signed in, or playing as a guest — either way the app is fully usable. */
  isReady: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  refreshProfile: () => Promise<void>;
  /** Patch the local profile (used after gamification RPCs return a fresh row). */
  setLocalProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');
  const [loading, setLoading] = useState(true);
  const loadedFor = useRef<string | null>(null);

  // A guest gets a real profile too, backed by localStorage instead of Postgres,
  // so every screen can read `profile` without asking who you are first.
  const [guestProfile, setGuestProfile] = useState<Profile | null>(() =>
    localStorage.getItem(GUEST_KEY) === '1' ? loadGuestProfile() : null
  );

  const loadProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase.rpc('mmd_ensure_profile');
    if (error) {
      console.warn('ensure_profile failed', error.message);
      return;
    }
    let prof = data as Profile;
    // Seed display name from sign-up metadata on first load.
    const metaName = (user.user_metadata?.name as string | undefined)?.trim();
    if (prof && !prof.display_name && metaName) {
      const { data: updated } = await supabase
        .from('mmd_profiles')
        .update({ display_name: metaName })
        .eq('id', user.id)
        .select()
        .single();
      if (updated) prof = updated as Profile;
    }
    setProfile(prof);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        loadedFor.current = null;
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load the profile whenever a new user signs in.
  useEffect(() => {
    const user = session?.user;
    if (!user) return;
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    setLoading(true);
    loadProfile(user).finally(() => setLoading(false));
  }, [session, loadProfile]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: SITE_URL },
    });
    if (error) throw error;
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setGuestProfile(null);
    // When email confirmation is on, there is no session yet.
    return { needsConfirm: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setGuestProfile(null);
  }, []);

  /**
   * Signing out drops you back into guest mode rather than to a locked door —
   * the app works without an account, so there is nothing to lock.
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
    setGuestProfile(loadGuestProfile());
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
    setGuestProfile(loadGuestProfile());
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user);
  }, [session, loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!session?.user) {
        // Guest: the same edit, written to the device instead.
        setGuestProfile(saveGuestProfile({ ...loadGuestProfile(), ...patch }));
        return;
      }
      const { data, error } = await supabase
        .from('mmd_profiles')
        .update(patch)
        .eq('id', session.user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data as Profile);
    },
    [session]
  );

  /** Guest progress lives on the device, so patches have to be written back. */
  const setLocalProfile = useCallback(
    (p: Profile) => {
      if (session) setProfile(p);
      else setGuestProfile(saveGuestProfile(p));
    },
    [session]
  );

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile: session ? profile : guestProfile,
      isGuest,
      loading,
      isReady: !!session || isGuest,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      refreshProfile,
      setLocalProfile,
      updateProfile,
    }),
    [
      session,
      profile,
      guestProfile,
      isGuest,
      loading,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      refreshProfile,
      setLocalProfile,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
