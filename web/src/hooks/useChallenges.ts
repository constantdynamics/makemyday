import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Challenge, Profile } from '../types/db';

export function useChallenges() {
  const { session, setLocalProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completed, setCompleted] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [all, mine] = await Promise.all([
      supabase.from('mmd_challenges').select('*'),
      session?.user
        ? supabase.from('mmd_user_challenges').select('challenge_id, completed_at')
        : Promise.resolve({ data: [] as { challenge_id: string; completed_at: string }[] }),
    ]);
    setChallenges(((all.data ?? []) as Challenge[]).sort((a, b) => a.points - b.points));
    const map: Record<string, string> = {};
    for (const row of (mine.data ?? []) as { challenge_id: string; completed_at: string }[]) {
      map[row.challenge_id] = row.completed_at;
    }
    setCompleted(map);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeChallenge = useCallback(
    async (id: string): Promise<Profile> => {
      const { data, error } = await supabase.rpc('mmd_complete_challenge', {
        p_challenge_id: id,
      });
      if (error) throw error;
      setCompleted((c) => ({ ...c, [id]: new Date().toISOString() }));
      setLocalProfile(data as Profile);
      return data as Profile;
    },
    [setLocalProfile]
  );

  return { challenges, completed, loading, refresh, completeChallenge };
}
