import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Completion, Profile } from '../types/db';

export interface CompleteInput {
  title: string;
  categoryId?: string | null;
  source?: 'curated' | 'osm' | 'challenge';
  lat?: number | null;
  lng?: number | null;
  placeName?: string | null;
  points?: number;
  note?: string | null;
  photoUrl?: string | null;
  rating?: number | null;
}

/** Reads the signed-in user's completion history and records new ones. */
export function useCompletions() {
  const { session, setLocalProfile } = useAuth();
  const [items, setItems] = useState<Completion[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.user) {
      setItems([]);
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, count: total } = await supabase
      .from('mmd_completions')
      .select('*', { count: 'exact' })
      .order('completed_at', { ascending: false })
      .limit(50);
    setItems((data ?? []) as Completion[]);
    setCount(total ?? data?.length ?? 0);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const complete = useCallback(
    async (input: CompleteInput): Promise<Profile> => {
      const { data, error } = await supabase.rpc('mmd_complete_activity', {
        p_title: input.title,
        p_category_id: input.categoryId ?? null,
        p_source: input.source ?? 'curated',
        p_lat: input.lat ?? null,
        p_lng: input.lng ?? null,
        p_place_name: input.placeName ?? null,
        p_points: input.points ?? 10,
        p_note: input.note ?? null,
        p_photo_url: input.photoUrl ?? null,
        p_rating: input.rating ?? null,
      });
      if (error) throw error;
      const prof = data as Profile;
      setLocalProfile(prof);
      refresh();
      return prof;
    },
    [refresh, setLocalProfile]
  );

  /** Back out of a dare — records the consequence (a broken streak) server-side. */
  const chickenOut = useCallback(async (): Promise<Profile> => {
    const { data, error } = await supabase.rpc('mmd_chicken_out');
    if (error) throw error;
    const prof = data as Profile;
    setLocalProfile(prof);
    return prof;
  }, [setLocalProfile]);

  return { items, count, loading, refresh, complete, chickenOut };
}
