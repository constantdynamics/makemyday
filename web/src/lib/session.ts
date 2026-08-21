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
export function searchRadius(cfg: SessionConfig, ranges: RangePrefs = DEFAULT_RANGES): number {
  const [min, max] = RADIUS_LIMITS[cfg.transport];
  const byTime = reachKm(cfg) * 1000;
  // Whatever the user set their wheel to must be searchable, even when it
  // reaches further than the time budget alone would justify.
  const wanted = clampRange(cfg.transport, ranges[cfg.transport]).maxKm * 1000;
  return Math.round(Math.min(Math.max(max, wanted), Math.max(min, byTime, wanted)));
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

/** How far the wheel may send you on one transport mode, in kilometres. */
export interface TransportRange {
  minKm: number;
  maxKm: number;
}

export type RangePrefs = Record<Transport, TransportRange>;

/**
 * Hard stops on what a range may be set to. Someone can want a 60 km car wheel;
 * nobody is served by a 400 km one, or by a wheel whose rings are 5 m apart.
 */
export const RANGE_LIMITS: Record<Transport, TransportRange> = {
  walk: { minKm: 0.2, maxKm: 25 },
  bike: { minKm: 0.5, maxKm: 60 },
  car: { minKm: 1, maxKm: 200 },
};

/**
 * Defaults, chosen to match what the time-based model produced for a typical
 * two-hour outing. They are only a starting point: the ranges are the user's to
 * set, per transport mode, and `RangePrefs` is what actually drives the wheel.
 */
export const DEFAULT_RANGES: RangePrefs = {
  walk: { minKm: 0, maxKm: 2 },
  bike: { minKm: 0, maxKm: 6.5 },
  car: { minKm: 0, maxKm: 20 },
};

export function clampRange(transport: Transport, range: TransportRange): TransportRange {
  const cap = RANGE_LIMITS[transport];
  const maxKm = Math.min(cap.maxKm, Math.max(cap.minKm, range.maxKm));
  // The floor may equal zero ("from right here"), but never overtake the ceiling.
  const minKm = Math.min(Math.max(0, range.minKm), maxKm - cap.minKm);
  return { minKm: Math.max(0, minKm), maxKm };
}

/**
 * The wheel is always a proper wheel. Eight is the floor the design asks for —
 * fewer wedges stops reading as a wheel and starts reading as a pie chart.
 */
export const MIN_WEDGES = 8;

/**
 * The rings the kilometre wheel offers for one transport mode.
 *
 * Edges grow rather than step evenly: the near rings are narrow, because the
 * difference between 200 m and 600 m matters when you are walking, while the
 * far ones are wide, because 18 km and 20 km are the same errand. Rounded for
 * legibility, then de-duplicated — and if rounding collapses two edges into
 * one, the wheel is rebuilt at full precision rather than losing a wedge.
 */
export function bandsForRange(range: TransportRange, wedges = MIN_WEDGES): DistanceBand[] {
  const span = Math.max(0.1, range.maxKm - range.minKm);
  const edgeAt = (i: number) => range.minKm + span * Math.pow(i / wedges, 1.45);

  const rounded: number[] = [];
  for (let i = 0; i <= wedges; i++) {
    const km = roundKm(edgeAt(i));
    if (!rounded.length || km > rounded[rounded.length - 1]) rounded.push(km);
  }
  // Rounding swallowed a wedge (a very short range): keep the exact edges, which
  // still read fine because they are small numbers with one decimal.
  const edges =
    rounded.length === wedges + 1
      ? rounded
      : Array.from({ length: wedges + 1 }, (_, i) => Math.round(edgeAt(i) * 100) / 100);

  return edges.slice(0, -1).map((from, i) => ({ fromKm: from, toKm: edges[i + 1] }));
}

/**
 * Whether a set of rings reads better in metres. A 500 m walking wheel labelled
 * in kilometres is a column of "0,0" and "0,1"; in metres it is legible.
 */
export function bandsInMetres(bands: DistanceBand[]): boolean {
  return bands.length > 0 && bands[bands.length - 1].toKm < 1;
}

/** Formats one ring edge in whichever unit the wheel is using. */
export function formatBandEdge(km: number, metres: boolean, lang: 'nl' | 'en'): string {
  return metres ? String(Math.round(km * 1000)) : formatKm(km, lang);
}

/** The rings for the session's current transport mode. */
export function distanceBands(cfg: SessionConfig, ranges: RangePrefs = DEFAULT_RANGES) {
  return bandsForRange(clampRange(cfg.transport, ranges[cfg.transport]));
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
