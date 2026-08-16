import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { completeChallengeLocal, loadGuestChallenges } from '../lib/localProgress';
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
    if (!session?.user) {
      setCompleted(loadGuestChallenges());
      setLoading(false);
      return;
    }
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
      if (!session?.user) {
        // The SQL pays out `ch.title_en` and `ch.points`; read them off the row
        // we already loaded so the local twin awards exactly the same.
        const ch = challenges.find((c) => c.id === id);
        const prof = completeChallengeLocal(id, ch?.title_en ?? 'Challenge', ch?.points ?? 10);
        setCompleted((c) => ({ ...c, [id]: new Date().toISOString() }));
        setLocalProfile(prof);
        return prof;
      }
      const { data, error } = await supabase.rpc('mmd_complete_challenge', {
        p_challenge_id: id,
      });
      if (error) throw error;
      setCompleted((c) => ({ ...c, [id]: new Date().toISOString() }));
      setLocalProfile(data as Profile);
      return data as Profile;
    },
    [challenges, session, setLocalProfile]
  );

  return { challenges, completed, loading, refresh, completeChallenge };
}
