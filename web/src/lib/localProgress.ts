/**
 * Guest progress, kept on the device.
 *
 * Everything the app does for a signed-in user — XP, level, streak, the
 * completion history, finished challenges — happens server-side in the
 * `mmd_complete_activity` / `mmd_complete_challenge` / `mmd_chicken_out` RPCs.
 * Without an account there is no `auth.uid()`, so those RPCs refuse the call and
 * the whole loop used to dead-end at a "please sign up" redirect.
 *
 * This module is the same bookkeeping in localStorage, so the app is complete
 * without ever logging in. **The rules below are a deliberate mirror of the SQL**
 * — if the RPCs change, change these too:
 *
 *   xp     += max(points, 0)
 *   level   = floor(xp / 250) + 1
 *   streak  = same day     -> max(streak, 1)
 *             yesterday    -> streak + 1
 *             anything else-> 1
 *   chicken out -> streak = 0
 *
 * Dates use UTC, exactly like the SQL (`now() at time zone 'utc'`), so a guest
 * who later signs in does not see their streak jump.
 */
import { STORAGE_PREFIX } from './config';
import type { Completion, Profile } from '../types/db';

const PROFILE_KEY = `${STORAGE_PREFIX}guest.profile`;
const COMPLETIONS_KEY = `${STORAGE_PREFIX}guest.completions`;
const CHALLENGES_KEY = `${STORAGE_PREFIX}guest.challenges`;

/** Keeps the history from growing without bound on a well-used device. */
const MAX_COMPLETIONS = 200;

/** The id a guest profile carries. Never a real user id, and never sent anywhere. */
export const GUEST_ID = 'guest';

const XP_PER_LEVEL = 250;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Yesterday in UTC, as `YYYY-MM-DD`. */
function yesterdayUtc(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota: progress simply doesn't persist */
  }
}

export function emptyGuestProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: GUEST_ID,
    username: null,
    display_name: null,
    avatar_emoji: '🧭',
    language: 'nl',
    home_lat: null,
    home_lng: null,
    home_label: null,
    xp: 0,
    level: 1,
    streak_count: 0,
    last_completed_date: null,
    is_premium: false,
    created_at: now,
    updated_at: now,
  };
}

export function loadGuestProfile(): Profile {
  const stored = read<Partial<Profile> | null>(PROFILE_KEY, null);
  return stored ? { ...emptyGuestProfile(), ...stored, id: GUEST_ID } : emptyGuestProfile();
}

export function saveGuestProfile(p: Profile): Profile {
  write(PROFILE_KEY, p);
  return p;
}

export function loadGuestCompletions(): Completion[] {
  return read<Completion[]>(COMPLETIONS_KEY, []);
}

/** Finished challenge ids mapped to when they were finished. */
export function loadGuestChallenges(): Record<string, string> {
  return read<Record<string, string>>(CHALLENGES_KEY, {});
}

export interface LocalCompleteInput {
  title: string;
  categoryId?: string | null;
  source?: string;
  lat?: number | null;
  lng?: number | null;
  placeName?: string | null;
  points?: number;
  note?: string | null;
  photoUrl?: string | null;
  rating?: number | null;
}

/** The localStorage twin of `mmd_complete_activity`. */
export function completeLocal(input: LocalCompleteInput): Profile {
  const prof = loadGuestProfile();
  const points = Math.max(input.points ?? 10, 0);
  const today = todayUtc();

  const completion: Completion = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: GUEST_ID,
    title: input.title,
    category_id: input.categoryId ?? null,
    source: input.source ?? 'curated',
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    place_name: input.placeName ?? null,
    points,
    note: input.note ?? null,
    photo_url: input.photoUrl ?? null,
    rating: input.rating != null && input.rating >= 1 && input.rating <= 5 ? input.rating : null,
    completed_at: new Date().toISOString(),
  };
  write(COMPLETIONS_KEY, [completion, ...loadGuestCompletions()].slice(0, MAX_COMPLETIONS));

  let streak: number;
  if (prof.last_completed_date === today) streak = Math.max(prof.streak_count, 1);
  else if (prof.last_completed_date === yesterdayUtc()) streak = prof.streak_count + 1;
  else streak = 1;

  const xp = prof.xp + points;
  return saveGuestProfile({
    ...prof,
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    streak_count: streak,
    last_completed_date: today,
    updated_at: new Date().toISOString(),
  });
}

/** The localStorage twin of `mmd_chicken_out`. */
export function chickenOutLocal(): Profile {
  return saveGuestProfile({
    ...loadGuestProfile(),
    streak_count: 0,
    updated_at: new Date().toISOString(),
  });
}

/**
 * The localStorage twin of `mmd_complete_challenge`: finishing one twice pays
 * out once, same as the `on conflict do nothing` in the SQL.
 */
export function completeChallengeLocal(id: string, title: string, points: number): Profile {
  const done = loadGuestChallenges();
  if (done[id]) return loadGuestProfile();
  write(CHALLENGES_KEY, { ...done, [id]: new Date().toISOString() });
  return completeLocal({ title, source: 'challenge', points });
}

/** Wipes guest progress — used by "start over" in Settings. */
export function resetGuestProgress(): void {
  for (const key of [PROFILE_KEY, COMPLETIONS_KEY, CHALLENGES_KEY]) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
