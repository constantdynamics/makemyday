import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Activity, Category } from '../types/db';

interface Catalog {
  categories: Category[];
  activities: Activity[];
}

let cache: Catalog | null = null;
let inflight: Promise<Catalog> | null = null;

async function load(): Promise<Catalog> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const [cats, acts] = await Promise.all([
      supabase.from('mmd_categories').select('*').order('sort_order'),
      supabase.from('mmd_activities').select('*'),
    ]);
    if (cats.error) throw cats.error;
    if (acts.error) throw acts.error;
    cache = {
      categories: (cats.data ?? []) as Category[],
      activities: (acts.data ?? []) as Activity[],
    };
    return cache;
  })();
  return inflight;
}

export function useCatalog() {
  const [data, setData] = useState<Catalog | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (cache) {
      setData(cache);
      return;
    }
    load()
      .then((c) => alive && setData(c))
      .catch((e) => alive && setError(e.message ?? 'error'));
    return () => {
      alive = false;
    };
  }, []);

  return {
    categories: data?.categories ?? [],
    activities: data?.activities ?? [],
    loading: !data && !error,
    error,
  };
}

/** Localized helpers kept here so screens stay declarative. */
export function categoryName(cat: Category, lang: 'nl' | 'en'): string {
  return lang === 'nl' ? cat.name_nl : cat.name_en;
}
export function activityTitle(a: Activity, lang: 'nl' | 'en'): string {
  return lang === 'nl' ? a.title_nl : a.title_en;
}
export function activityDescription(a: Activity, lang: 'nl' | 'en'): string {
  return (lang === 'nl' ? a.description_nl : a.description_en) ?? '';
}
