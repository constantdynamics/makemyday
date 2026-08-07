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
import { bearing, compassPoint, formatDistance, type LatLng } from '../../lib/geo';
import {
  sessionFiltered,
  formatMinutes,
  TRANSPORT_RADIUS,
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
    blips,
    canDraw,
    durationLabel,
    categories,
    radiusMeters: TRANSPORT_RADIUS[config.transport],
  };
}
