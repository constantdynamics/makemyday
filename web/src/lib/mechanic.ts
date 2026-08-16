/**
 * "Kiesmethodes" — the user picks *how* chance decides. Every mechanic is a
 * presentation of the same draw: which category and which place comes out is
 * decided by the existing suggestion logic (see `features/pick/usePick`), never
 * by the mechanic itself.
 *
 * This module is framework-agnostic on purpose: it holds the registry metadata
 * and the persisted choice, so screens and components stay declarative.
 */
import { STORAGE_PREFIX } from './config';

export type MechanicId =
  | 'wheel'
  | 'slot'
  | 'compass'
  | 'plinko'
  | 'scratch'
  | 'deck'
  | 'reels'
  | 'radar'
  | 'hold'
  | 'letter'
  | 'quest';

export interface MechanicMeta {
  id: MechanicId;
  /** Icon name from the registry in `components/icons/Icon.tsx`. */
  icon: string;
  /** Signature colour — drives the tile, the dot and the entry card. */
  accent: string;
  /** The wheel lives inside the dashboard card; everything else takes over. */
  fullscreen: boolean;
}

/** Registry. Labels live in `i18n/strings.ts` under `mechanic.<id>.*`. */
export const MECHANICS: MechanicMeta[] = [
  { id: 'wheel', icon: 'refresh', accent: '#7c5cff', fullscreen: false },
  { id: 'slot', icon: 'bolt', accent: '#ff8a5c', fullscreen: true },
  { id: 'compass', icon: 'compass', accent: '#e8e4ff', fullscreen: true },
  { id: 'plinko', icon: 'chevron-down', accent: '#4cc9f0', fullscreen: true },
  { id: 'scratch', icon: 'sparkles', accent: '#e7c98a', fullscreen: true },
  { id: 'deck', icon: 'list', accent: '#ef4bbd', fullscreen: true },
  { id: 'reels', icon: 'sliders', accent: '#aaa6c6', fullscreen: true },
  { id: 'radar', icon: 'target', accent: '#34d399', fullscreen: true },
  { id: 'hold', icon: 'clock', accent: '#9d7bff', fullscreen: true },
  { id: 'letter', icon: 'message', accent: '#e0525f', fullscreen: true },
  { id: 'quest', icon: 'navigation', accent: '#5ad1c8', fullscreen: true },
];

export const DEFAULT_MECHANIC: MechanicId = 'wheel';

export function mechanicMeta(id: MechanicId): MechanicMeta {
  return MECHANICS.find((m) => m.id === id) ?? MECHANICS[0];
}

const KEY = `${STORAGE_PREFIX}mechanic`;

function isMechanicId(value: string): value is MechanicId {
  return MECHANICS.some((m) => m.id === value);
}

export function loadMechanic(): MechanicId {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && isMechanicId(raw)) return raw;
  } catch {
    /* ignore unavailable storage */
  }
  return DEFAULT_MECHANIC;
}

export function saveMechanic(id: MechanicId): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore quota errors */
  }
}

/** `color-mix` tint helper — the designs lean on it heavily for accent surfaces. */
export function tint(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
