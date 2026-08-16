/** The contract every mechanic implements. Presentation only — see `usePick`. */
import type { Category } from '../../types/db';
import type { DistanceBand } from '../../lib/session';
import type { Blip, Pick, Spot } from './usePick';

export type Phase = 'idle' | 'running' | 'done';

/** The draw functions, handed down so a mechanic can shape its own request. */
export interface PickApi {
  drawPick: (category?: Category) => Pick | null;
  drawSeries: (count: number) => Pick[];
  drawByRange: (t: number) => Pick | null;
  /**
   * The wheel game: a direction (0 = N, clockwise) plus a kilometre ring name a
   * spot on the map, and whatever stands closest to it is the adventure.
   */
  drawAtSpot: (octant: number, band: DistanceBand) => Spot;
  /** Known places per compass sector, indexed like `drawAtSpot`'s octant. */
  sectorCounts: number[];
  /** The kilometre rings this session's transport and time allow. */
  bands: DistanceBand[];
  blips: Blip[];
  canDraw: boolean;
  durationLabel: string;
  /** Several mechanics cycle through the categories as their reel symbols. */
  categories: Category[];
  /** Current search radius in metres — the radar prints it on screen. */
  radiusMeters: number;
}

export interface MechanicProps {
  phase: Phase;
  /**
   * Known as soon as the mechanic starts — the wheel needs it to know where to
   * stop — but only shown to the user once `onSettled` has fired.
   */
  pick: Pick | null;
  api: PickApi;
  /** Kicks the mechanic off. Pass a pick to override the host's own draw. */
  onStart: (pick?: Pick | null) => void;
  /** Animation finished; the result may be revealed. */
  onSettled: () => void;
  /** "Ik doe het" — hands over to the existing adventure sheet. */
  onAccept: () => void;
  /** Back to `idle` for another go. */
  onReset: () => void;
  reducedMotion: boolean;
}
