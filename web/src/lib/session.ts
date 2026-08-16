/**
 * "Adventure session" configuration — the user tells us how they're getting
 * around, how much time they have, and who they're with, and we tailor the
 * wheel's suggestions to fit. Everything here is framework-agnostic so the
 * context and screens stay declarative.
 */
import type { Activity } from '../types/db';

export type Transport = 'walk' | 'bike' | 'car';
export type GroupSize = 'solo' | 'duo' | 'group';

export interface SessionConfig {
  transport: Transport;
  /** Minutes available for the adventure. */
  minutes: number;
  group: GroupSize;
}

/**
 * How far you actually get — transport *and* time together.
 *
 * The old model was a fixed radius per transport mode, which meant a half-hour
 * stroll and a four-hour hike searched the same 1,5 km. These speeds are
 * door-to-door averages: they already allow for traffic lights, locking up your
 * bike and finding a parking spot, so they sit below the raw travel speeds.
 */
export const TRANSPORT_SPEED_KMH: Record<Transport, number> = {
  walk: 4.5,
  bike: 14,
  car: 45,
};

/**
 * Share of the session spent travelling. The rest is the activity itself —
 * spend everything on the journey and you arrive with no time to enjoy it.
 * Both legs come out of this budget, so one-way reach is half of it.
 */
const TRAVEL_SHARE = 0.45;

/** Metres, [floor, ceiling], keeping the Overpass search sane at both extremes. */
const RADIUS_LIMITS: Record<Transport, [number, number]> = {
  walk: [1200, 4000],
  bike: [3000, 15000],
  car: [8000, 40000],
};

/** How far away an adventure may reasonably be, one way, in kilometres. */
export function reachKm(cfg: SessionConfig): number {
  const oneWayHours = (cfg.minutes * TRAVEL_SHARE) / 2 / 60;
  return TRANSPORT_SPEED_KMH[cfg.transport] * oneWayHours;
}

/**
 * Search radius (metres) we hand to Overpass. Derived from `reachKm`, then
 * clamped: too small and a short session finds nothing at all, too large and we
 * suggest places you can't possibly get to and back from.
 */
export function searchRadius(cfg: SessionConfig): number {
  const [min, max] = RADIUS_LIMITS[cfg.transport];
  return Math.round(Math.min(max, Math.max(min, reachKm(cfg) * 1000)));
}

/** Rounds a distance to something a human would say out loud. */
function roundKm(km: number): number {
  if (km < 1) return Math.round(km * 10) / 10;
  if (km < 10) return Math.round(km * 2) / 2;
  return Math.round(km);
}

export interface DistanceBand {
  fromKm: number;
  toKm: number;
}

/** Where the band edges fall as a fraction of the full reach. */
const BAND_EDGES = [0, 0.1, 0.22, 0.38, 0.58, 0.78, 1];

/**
 * The six rings the kilometre wheel offers, from "around the corner" to the
 * edge of what your transport and time allow. Edges are rounded for legibility
 * and then de-duplicated, so a very short session simply gets fewer, wider
 * bands instead of six identical ones.
 */
export function distanceBands(cfg: SessionConfig): DistanceBand[] {
  const reach = Math.min(reachKm(cfg), searchRadius(cfg) / 1000);
  const edges: number[] = [];
  for (const f of BAND_EDGES) {
    const km = roundKm(reach * f);
    if (!edges.length || km > edges[edges.length - 1]) edges.push(km);
  }
  // A reach under ~200 m rounds everything to zero; give it one honest band.
  if (edges.length < 2) return [{ fromKm: 0, toKm: Math.max(0.3, roundKm(reach)) }];
  return edges.slice(0, -1).map((from, i) => ({ fromKm: from, toKm: edges[i + 1] }));
}

export const TRANSPORT_ICON: Record<Transport, string> = {
  walk: 'walk',
  bike: 'bike',
  car: 'car',
};

/** Time presets offered in the setup sheet, in minutes. */
export const TIME_PRESETS = [30, 60, 120, 240] as const;

export const GROUP_ICON: Record<GroupSize, string> = {
  solo: 'user',
  duo: 'heart',
  group: 'users',
};

export const DEFAULT_SESSION: SessionConfig = {
  transport: 'bike',
  minutes: 120,
  group: 'solo',
};

/**
 * How many times you may chicken out of a dare per session before the wheel
 * stops letting you off the hook. Premium members get a longer leash.
 */
export const SKIP_LIMIT = { free: 1, premium: 5 } as const;

export function skipLimit(isPremium: boolean | null | undefined): number {
  return isPremium ? SKIP_LIMIT.premium : SKIP_LIMIT.free;
}

/** Does this activity suit the chosen group size? Soft, tag-based heuristic. */
function groupOk(tags: string[], group: GroupSize): boolean {
  const has = (t: string) => tags.includes(t);
  if (group === 'solo') return !has('group');
  if (group === 'group') return !(has('solo') && !has('group') && !has('date'));
  return true; // duo fits just about anything
}

/**
 * Narrows a pool of curated activities to those that fit the session — first by
 * time, then by group. Always degrades gracefully so callers never get an empty
 * pool when the catalog isn't empty.
 */
export function sessionFiltered(acts: Activity[], cfg: SessionConfig): Activity[] {
  const byTime = acts.filter((a) => a.min_duration <= cfg.minutes);
  const base = byTime.length ? byTime : acts;
  const byGroup = base.filter((a) => groupOk(a.tags, cfg.group));
  return byGroup.length ? byGroup : base;
}

export function transportLabel(t: Transport, lang: 'nl' | 'en'): string {
  const nl: Record<Transport, string> = { walk: 'Lopen', bike: 'Fiets', car: 'Auto' };
  const en: Record<Transport, string> = { walk: 'Walking', bike: 'Bike', car: 'Car' };
  return (lang === 'nl' ? nl : en)[t];
}

/** "1,5" / "1.5" — kilometres, without the unit, in the reader's decimal style. */
export function formatKm(km: number, lang: 'nl' | 'en'): string {
  const s = Number.isInteger(km) ? String(km) : km.toFixed(1);
  return lang === 'nl' ? s.replace('.', ',') : s;
}

export function formatMinutes(min: number, lang: 'nl' | 'en'): string {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  const unit = lang === 'nl' ? 'uur' : h === 1 ? 'hour' : 'hours';
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${unit}`;
}
