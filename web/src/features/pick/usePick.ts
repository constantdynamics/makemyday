/**
 * The draw itself — shared by every mechanic.
 *
 * Which category and which place come out is decided here, using the same rules
 * the dashboard has always used: real OpenStreetMap places when we know where
 * you are, the curated catalogue otherwise, narrowed by your session settings
 * and nudged indoors when the weather is miserable. A mechanic only *presents*
 * the result — it never influences it.
 */
import { useCallback, useMemo } from 'react';
import { activityTitle, activityDescription, categoryName } from '../../hooks/useCatalog';
import { isOpenNow, openLabel } from '../../lib/openingHours';
import {
  bearing,
  compassPoint,
  destinationPoint,
  distanceMeters,
  formatDistance,
  type LatLng,
} from '../../lib/geo';
import {
  sessionFiltered,
  formatMinutes,
  searchRadius,
  distanceBands,
  type DistanceBand,
  type SessionConfig,
} from '../../lib/session';
import type { Poi } from '../../lib/overpass';
import type { Activity, Category } from '../../types/db';

/** A drawn suggestion, plus the labels the mechanics render. */
export interface Pick {
  title: string;
  description: string;
  category: Category;
  source: 'curated' | 'osm';
  coords?: LatLng;
  placeName?: string;
  distance?: number;
  emoji: string;
  /** true = open, false = closed, null/undefined = unknown. */
  openState?: boolean | null;
  openingHours?: string;

  /* ---- derived, so mechanics stay presentational ---- */
  /** "480 m" / "1,1 km" — null for curated ideas with no place attached. */
  distanceLabel: string | null;
  /** "Nu open · Tu-Su 10:00-17:00" — null when opening hours are unknown. */
  openingLabel: string | null;
  /** Session duration, e.g. "2 uur". */
  durationLabel: string;
  /** Degrees clockwise from north, or null without a location. */
  heading: number | null;
  /** "NO" / "NE" — the compass point for `heading`. */
  headingLabel: string | null;
}

/** What the wheel game produces: a spot on the map, and what stands there. */
export interface Spot {
  /** Where the wheels pointed. Null without a location fix. */
  target: LatLng | null;
  /** The nearest real place to that spot, or a curated idea as a fallback. */
  pick: Pick | null;
  /** How far that place sits from the spot the wheels named, in metres. */
  offMeters: number | null;
}

/** One dot on the radar screen. */
export interface Blip {
  id: string;
  name: string;
  heading: number;
  distance: number;
  categoryId: string;
}

interface Options {
  categories: Category[];
  activities: Activity[];
  pois: Poi[];
  origin: LatLng | null;
  config: SessionConfig;
  /** From `useWeather` — steers the curated pool indoors. */
  preferIndoor: boolean;
  lang: 'nl' | 'en';
}

function sample<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function usePick({
  categories,
  activities,
  pois,
  origin,
  config,
  preferIndoor,
  lang,
}: Options) {
  const durationLabel = formatMinutes(config.minutes, lang);

  /** Builds a suggestion for one category — the rules the dashboard always had. */
  const buildFor = useCallback(
    (cat: Category, fromPois?: Poi[]): Pick | null => {
      const pool = fromPois ?? pois;
      const localPois = pool.filter((p) => p.categoryId === cat.id);

      if (origin && localPois.length) {
        // Prefer places that aren't explicitly closed right now; fall back to the
        // full list if opening hours rule everything out.
        const openish = localPois.filter((p) => isOpenNow(p.tags.opening_hours) !== false);
        const pickFrom = openish.length ? openish : localPois;
        const poi = pickFrom[Math.floor(Math.random() * Math.min(pickFrom.length, 8))];
        const coords = { lat: poi.lat, lng: poi.lng };
        const state = isOpenNow(poi.tags.opening_hours);
        const label = openLabel(state, lang);
        const heading = bearing(origin, coords);
        return {
          title: `${lang === 'nl' ? 'Bezoek' : 'Visit'} ${poi.name}`,
          description: categoryName(cat, lang),
          category: cat,
          source: 'osm',
          coords,
          placeName: poi.name,
          distance: poi.distance,
          emoji: '📍',
          openState: state,
          openingHours: poi.tags.opening_hours,
          distanceLabel: formatDistance(poi.distance, lang),
          openingLabel: label
            ? poi.tags.opening_hours
              ? `${label} · ${poi.tags.opening_hours}`
              : label
            : null,
          durationLabel,
          heading,
          headingLabel: compassPoint(heading, lang),
        };
      }

      const inCat = sessionFiltered(
        activities.filter((a) => a.category_id === cat.id),
        config
      );
      let curated = inCat.length ? inCat : sessionFiltered(activities, config);
      // When it's wet or cold, steer toward indoor activities if we can.
      if (preferIndoor) {
        const indoor = curated.filter((a) => a.indoor);
        if (indoor.length) curated = indoor;
      }
      if (!curated.length) return null;
      const a = sample(curated);
      return {
        title: activityTitle(a, lang),
        description: activityDescription(a, lang),
        category: cat,
        source: 'curated',
        emoji: a.emoji,
        distanceLabel: null,
        openingLabel: null,
        durationLabel,
        heading: null,
        headingLabel: null,
      };
    },
    [activities, config, durationLabel, lang, origin, pois, preferIndoor]
  );

  /** Draws one suggestion. Without a category, chance picks one too. */
  const drawPick = useCallback(
    (cat?: Category): Pick | null => {
      if (!categories.length) return null;
      return buildFor(cat ?? sample(categories));
    },
    [buildFor, categories]
  );

  /**
   * Several distinct suggestions at once — the card deck deals three, and the
   * two you throw away have to be real, or the choice feels rigged.
   */
  const drawSeries = useCallback(
    (count: number): Pick[] => {
      if (!categories.length) return [];
      const shuffled = [...categories].sort(() => Math.random() - 0.5);
      const out: Pick[] = [];
      for (let i = 0; out.length < count && i < shuffled.length * 2; i++) {
        const p = buildFor(shuffled[i % shuffled.length]);
        if (p && !out.some((o) => o.title === p.title)) out.push(p);
      }
      return out;
    },
    [buildFor, categories]
  );

  /**
   * Draws from a distance band — "hold" charges longer for a further adventure.
   * `t` runs 0 (closest) to 1 (furthest). Falls back to a plain draw when we
   * have no places to rank.
   */
  const drawByRange = useCallback(
    (t: number): Pick | null => {
      if (!origin || pois.length === 0) return drawPick();
      const sorted = [...pois].sort((a, b) => a.distance - b.distance);
      const span = Math.max(1, Math.floor(sorted.length / 4));
      const centre = Math.round(Math.min(1, Math.max(0, t)) * (sorted.length - 1));
      const from = Math.max(0, centre - Math.floor(span / 2));
      const band = sorted.slice(from, from + span);
      const poi = sample(band.length ? band : sorted);
      const cat = categories.find((c) => c.id === poi.categoryId);
      return cat ? buildFor(cat, [poi]) : drawPick();
    },
    [buildFor, categories, drawPick, origin, pois]
  );

  /** How many known places lie each way — the game shows it per wind direction. */
  const sectorCounts = useMemo<number[]>(() => {
    const counts = new Array(8).fill(0);
    if (!origin) return counts;
    for (const p of pois) {
      const deg = bearing(origin, { lat: p.lat, lng: p.lng });
      counts[Math.round(deg / 45) % 8]++;
    }
    return counts;
  }, [origin, pois]);

  /**
   * The compass points worth landing on: the ones with something there.
   *
   * Chance may not send you into the North Sea. Every place in `pois` comes from
   * OpenStreetMap, so it is by definition somewhere you can actually stand — if
   * a sector holds none of them, that direction is water, motorway or farmland
   * and the wheel skips it rather than picking a pretty coordinate in the surf.
   *
   * With no fix at all there is no map to run into, so all eight stay open and
   * the draw falls back to the curated ideas.
   */
  const availableOctants = useMemo<number[]>(() => {
    if (!origin || !pois.length) return [0, 1, 2, 3, 4, 5, 6, 7];
    const open = sectorCounts.flatMap((n, i) => (n > 0 ? [i] : []));
    return open.length ? open : [0, 1, 2, 3, 4, 5, 6, 7];
  }, [origin, pois, sectorCounts]);

  /**
   * The distance rings worth offering **for one direction**.
   *
   * This is the other half of not ending up in the sea. The session's transport
   * and time say how far you *could* travel; this narrows that to how far there
   * is anything to travel *to* on this particular bearing. Stand on the coast
   * facing west and the far rings simply disappear from the wheel, because
   * nothing in that sector sits at that range.
   */
  const bandsFor = useCallback(
    (octant: number): DistanceBand[] => {
      const all = distanceBands(config);
      if (!origin || !pois.length) return all;

      const centre = (((octant % 8) + 8) % 8) * 45;
      const inSector = pois.filter((p) => {
        const deg = bearing(origin, { lat: p.lat, lng: p.lng });
        return Math.abs(((deg - centre + 540) % 360) - 180) <= 22.5;
      });
      if (!inSector.length) return all;

      // A ring counts as reachable when a real place sits inside it. The last
      // ring also absorbs anything beyond it, so the furthest place on this
      // bearing is always offered even when it overshoots the session's reach.
      const last = all.length - 1;
      const usable = all.filter((b, i) =>
        inSector.some(
          (p) => p.distance >= b.fromKm * 1000 && (i === last || p.distance <= b.toKm * 1000)
        )
      );
      return usable.length ? usable : all;
    },
    [config, origin, pois]
  );

  /**
   * The wheel game's draw: chance names a **place on the map**, not an activity.
   *
   * A direction (one of eight) and a distance band together describe one spot —
   * "2,5 km to the north-east" is a coordinate, and `destinationPoint` works out
   * which one. Whatever real place sits closest to that spot is your adventure,
   * however odd; that arbitrariness is the game.
   *
   * Without a location fix there is no spot to compute, so it degrades to an
   * ordinary draw and the mechanic shows the direction on its own.
   */
  const drawAtSpot = useCallback(
    (octant: number, band: DistanceBand): Spot => {
      const bearingDeg = (((octant % 8) + 8) % 8) * 45;
      const meters = ((band.fromKm + band.toKm) / 2) * 1000;
      if (!origin) return { target: null, pick: drawPick(), offMeters: null };

      const target = destinationPoint(origin, bearingDeg, meters);
      if (!pois.length) return { target, pick: drawPick(), offMeters: null };

      let best = pois[0];
      let bestOff = Infinity;
      for (const p of pois) {
        const off = distanceMeters(target, { lat: p.lat, lng: p.lng });
        if (off < bestOff) {
          bestOff = off;
          best = p;
        }
      }
      const cat = categories.find((c) => c.id === best.categoryId);
      return {
        target,
        pick: cat ? buildFor(cat, [best]) : drawPick(),
        offMeters: Math.round(bestOff),
      };
    },
    [buildFor, categories, drawPick, origin, pois]
  );

  /** Every nearby place as a radar contact. */
  const blips = useMemo<Blip[]>(() => {
    if (!origin) return [];
    return pois.slice(0, 24).map((p) => ({
      id: p.id,
      name: p.name,
      heading: bearing(origin, { lat: p.lat, lng: p.lng }),
      distance: p.distance,
      categoryId: p.categoryId,
    }));
  }, [origin, pois]);

  /** Nothing to draw from means the mechanic must not start. */
  const canDraw = categories.length > 0 && (pois.length > 0 || activities.length > 0);

  return {
    drawPick,
    drawSeries,
    drawByRange,
    drawAtSpot,
    sectorCounts,
    availableOctants,
    bandsFor,
    bands: distanceBands(config),
    blips,
    canDraw,
    durationLabel,
    categories,
    radiusMeters: searchRadius(config),
  };
}
