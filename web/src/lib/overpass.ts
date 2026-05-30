import { distanceMeters, type LatLng } from './geo';

export interface Poi {
  id: string;
  name: string;
  lat: number;
  lng: number;
  categoryId: string;
  kind: string; // e.g. "cafe", "museum"
  distance: number; // metres from origin
  tags: Record<string, string>;
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/**
 * Live POI discovery via the OpenStreetMap Overpass API (no API key required).
 *
 * @param origin   user location
 * @param radius   search radius in metres
 * @param filters  list of `key=value` OSM tag filters keyed by category id
 */
export async function fetchNearbyPois(
  origin: LatLng,
  radius: number,
  filters: { categoryId: string; osm: string[] }[],
  signal?: AbortSignal
): Promise<Poi[]> {
  const clauses: string[] = [];
  for (const { osm } of filters) {
    for (const tag of osm) {
      const [k, v] = tag.split('=');
      // nodes + ways so we catch both points and building footprints
      clauses.push(`node["${k}"="${v}"](around:${radius},${origin.lat},${origin.lng});`);
      clauses.push(`way["${k}"="${v}"](around:${radius},${origin.lat},${origin.lng});`);
    }
  }
  const query = `[out:json][timeout:25];(${clauses.join('')});out center 60;`;

  const lookup = buildTagLookup(filters);
  let lastErr: unknown;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal,
      });
      if (!res.ok) throw new Error(`overpass ${res.status}`);
      const data = await res.json();
      return normalize(data.elements ?? [], origin, lookup);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('overpass-failed');
}

function buildTagLookup(filters: { categoryId: string; osm: string[] }[]) {
  const map = new Map<string, string>(); // "key=value" -> categoryId
  for (const { categoryId, osm } of filters) {
    for (const tag of osm) map.set(tag, categoryId);
  }
  return map;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function normalize(
  elements: OverpassElement[],
  origin: LatLng,
  lookup: Map<string, string>
): Poi[] {
  const seen = new Set<string>();
  const pois: Poi[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const dedupe = `${name}@${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    let categoryId = 'landmark';
    let kind = 'place';
    for (const [k, v] of Object.entries(tags)) {
      const hit = lookup.get(`${k}=${v}`);
      if (hit) {
        categoryId = hit;
        kind = v;
        break;
      }
    }

    pois.push({
      id: `${el.type}/${el.id}`,
      name,
      lat,
      lng,
      categoryId,
      kind,
      tags,
      distance: distanceMeters(origin, { lat, lng }),
    });
  }

  return pois.sort((a, b) => a.distance - b.distance);
}
