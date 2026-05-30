/**
 * Runtime configuration.
 *
 * The Supabase URL + publishable key are safe to ship in client code — they are
 * protected by Row Level Security on the server. We read them from Vite env vars
 * when present (e.g. local `.env`), and fall back to the project defaults so the
 * static GitHub Pages build works without any CI secrets.
 */

const env = import.meta.env;

export const SUPABASE_URL: string =
  env.VITE_SUPABASE_URL || 'https://wmdopfocqufsquzvemka.supabase.co';

export const SUPABASE_ANON_KEY: string =
  env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_0vzeEC0FttISlsEiDaFCnw_N7bjjNym';

/** Storage key prefix so we never collide with other apps on the same origin. */
export const STORAGE_PREFIX = 'mmd:';
