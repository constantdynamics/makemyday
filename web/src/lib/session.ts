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

/** Search radius (metres) we hand to Overpass per transport mode. */
export const TRANSPORT_RADIUS: Record<Transport, number> = {
  walk: 1500,
  bike: 6000,
  car: 25000,
};

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

export function formatMinutes(min: number, lang: 'nl' | 'en'): string {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  const unit = lang === 'nl' ? 'uur' : h === 1 ? 'hour' : 'hours';
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${unit}`;
}
