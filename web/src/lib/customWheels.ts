/**
 * Wheels the user builds themselves.
 *
 * The app's own wheels answer questions it knows about — which category, which
 * direction, how far. This is the escape hatch for every question it doesn't:
 * "waar gaan we eten?", "wat halen we bij de supermarkt?", "wie doet de afwas?".
 * You name the wheel, you write the wedges, chance does the rest.
 *
 * Stored on the device, like the rest of guest progress — no account needed.
 */
import { STORAGE_PREFIX } from './config';
import { MIN_WEDGES } from './session';

const KEY = `${STORAGE_PREFIX}wheels`;

/** Guard rails: a wheel nobody can read is not a wheel. */
export const MAX_WHEELS = 40;
export const MAX_OPTIONS = 40;
export const MAX_NAME = 40;
export const MAX_OPTION = 60;

export interface CustomWheel {
  id: string;
  name: string;
  /** Shown on the list tile and in the middle of the wheel. */
  emoji: string;
  /** The wedges, in the order the user wrote them. At least two to be spinnable. */
  options: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Starter wheels offered on an empty list. The name and the options themselves
 * live in the dictionaries (`wheels.tpl.<id>.name` / `.options`, the latter a
 * comma-separated list) so both languages read naturally.
 */
export const WHEEL_TEMPLATES = [
  { id: 'dinner', emoji: '🍽️' },
  { id: 'shop', emoji: '🛒' },
  { id: 'evening', emoji: '🎬' },
] as const;

function read(): CustomWheel[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomWheel[]) : [];
  } catch {
    return [];
  }
}

function write(wheels: CustomWheel[]): CustomWheel[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(wheels));
  } catch {
    /* private mode or quota: the wheel simply doesn't persist */
  }
  return wheels;
}

export function loadWheels(): CustomWheel[] {
  return read();
}

export function getWheel(id: string): CustomWheel | null {
  return read().find((w) => w.id === id) ?? null;
}

function newId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Trims, drops blanks and de-duplicates — an option list with gaps spins oddly. */
export function cleanOptions(options: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of options) {
    const value = raw.trim().slice(0, MAX_OPTION);
    if (!value) continue;
    const key = value.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= MAX_OPTIONS) break;
  }
  return out;
}

export function saveWheel(input: {
  id?: string;
  name: string;
  emoji: string;
  options: string[];
}): CustomWheel | null {
  const wheels = read();
  const now = new Date().toISOString();
  const wheel: CustomWheel = {
    id: input.id ?? newId(),
    name: input.name.trim().slice(0, MAX_NAME) || '—',
    emoji: input.emoji || '🎡',
    options: cleanOptions(input.options),
    createdAt: now,
    updatedAt: now,
  };

  const at = wheels.findIndex((w) => w.id === wheel.id);
  if (at >= 0) {
    wheel.createdAt = wheels[at].createdAt;
    wheels[at] = wheel;
  } else {
    if (wheels.length >= MAX_WHEELS) return null;
    wheels.unshift(wheel);
  }
  write(wheels);
  return wheel;
}

export function deleteWheel(id: string): void {
  write(read().filter((w) => w.id !== id));
}

/** A wheel needs something to choose between. */
export function isSpinnable(wheel: CustomWheel): boolean {
  return wheel.options.length >= 2;
}

/**
 * The wedges to draw for a wheel, padded to at least `MIN_WEDGES`.
 *
 * A four-option wheel drawn as four wedges looks like a pie chart, so the option
 * list is repeated around the rim until there are enough. Every option is
 * repeated the *same* number of times, so the odds stay exactly uniform — this
 * changes how the wheel looks, never what it decides.
 */
export function wedgesFor(options: string[], min = MIN_WEDGES): string[] {
  if (options.length === 0) return [];
  const repeats = Math.max(1, Math.ceil(min / options.length));
  const out: string[] = [];
  for (let r = 0; r < repeats; r++) out.push(...options);
  return out;
}
