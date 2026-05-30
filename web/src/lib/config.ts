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
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0vzeEC0FttISlsEiDaFCnw_N7bjjNym';

/**
 * Public URL the app is served from — used as the redirect target for
 * confirmation/recovery emails so links never point at a dev `localhost`.
 * Defaults to wherever the app is currently running (origin + Vite base), which
 * is correct in production and during local dev alike. Override with
 * `VITE_SITE_URL` if the app lives behind a custom domain.
 */
export const SITE_URL: string =
  env.VITE_SITE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : 'https://constantdynamics.github.io/makemyday/');

/** Storage key prefix so we never collide with other apps on the same origin. */
export const STORAGE_PREFIX = 'mmd:';
