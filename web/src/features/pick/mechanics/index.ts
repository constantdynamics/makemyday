/**
 * Registry of the eleven take-over mechanics. They're lazy: the dashboard only
 * ever needs the wheel, so the rest stay out of the initial bundle until
 * somebody actually picks one.
 */
import { lazy, type ComponentType } from 'react';
import type { MechanicId } from '../../../lib/mechanic';
import type { MechanicProps } from '../types';

type Loader = ComponentType<MechanicProps>;

export const FULLSCREEN_MECHANICS: Record<Exclude<MechanicId, 'wheel'>, Loader> = {
  slot: lazy(() => import('./SlotMechanic').then((m) => ({ default: m.SlotMechanic }))),
  compass: lazy(() => import('./CompassMechanic').then((m) => ({ default: m.CompassMechanic }))),
  plinko: lazy(() => import('./PlinkoMechanic').then((m) => ({ default: m.PlinkoMechanic }))),
  scratch: lazy(() => import('./ScratchMechanic').then((m) => ({ default: m.ScratchMechanic }))),
  deck: lazy(() => import('./DeckMechanic').then((m) => ({ default: m.DeckMechanic }))),
  reels: lazy(() => import('./ReelsMechanic').then((m) => ({ default: m.ReelsMechanic }))),
  radar: lazy(() => import('./RadarMechanic').then((m) => ({ default: m.RadarMechanic }))),
  hold: lazy(() => import('./HoldMechanic').then((m) => ({ default: m.HoldMechanic }))),
  letter: lazy(() => import('./LetterMechanic').then((m) => ({ default: m.LetterMechanic }))),
  wind: lazy(() => import('./WindMechanic').then((m) => ({ default: m.WindMechanic }))),
  distance: lazy(() => import('./DistanceMechanic').then((m) => ({ default: m.DistanceMechanic }))),
};

export function isFullscreen(id: MechanicId): id is Exclude<MechanicId, 'wheel'> {
  return id !== 'wheel';
}
