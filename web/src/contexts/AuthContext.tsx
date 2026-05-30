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
import { STORAGE_PREFIX } from '../lib/config';
import type { Profile } from '../types/db';

const GUEST_KEY = `${STORAGE_PREFIX}guest`;

interface AuthValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isGuest: boolean;
  loading: boolean;
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

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
      // When email confirmation is on, there is no session yet.
      return { needsConfirm: !data.session };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setProfile(null);
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user);
  }, [session, loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!session?.user) return;
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

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isGuest,
      loading,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      refreshProfile,
      setLocalProfile: setProfile,
      updateProfile,
    }),
    [session, profile, isGuest, loading, signUp, signIn, signOut, continueAsGuest, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
