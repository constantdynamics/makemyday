import fetch from 'node-fetch';
import { config } from '../config';
import { GeoLocation } from '@makemyday/shared';
import { calculateBoundingBox } from '@makemyday/shared';
import { OSM_TAGS } from '@makemyday/shared';
import { redis } from '../database/connection';
import { logger } from '../utils/logger';

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags: Record<string, string>;
  center?: { lat: number; lon: number };
}

export class OSMService {
  private static CACHE_TTL = 604800; // 1 week

  static async queryNearbyPOIs(
    center: GeoLocation,
    radiusMeters: number,
    filters: string[] = []
  ): Promise<any[]> {
    const bbox = calculateBoundingBox(center, radiusMeters);
    const cacheKey = `osm:nearby:${center.lat}:${center.lng}:${radiusMeters}:${filters.join(',')}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build Overpass query
    const query = this.buildOverpassQuery(bbox, filters);

    try {
      const response = await fetch(config.externalApis.overpassUrl, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.ok) {
        throw new Error(`OSM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const pois = this.processOSMData(data.elements);

      // Cache results
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(pois));

      return pois;
    } catch (error) {
      logger.error('OSM query error:', error);
      throw error;
    }
  }

  private static buildOverpassQuery(
    bbox: [number, number, number, number],
    filters: string[]
  ): string {
    const [minLat, minLng, maxLat, maxLng] = bbox;
    const bboxString = `${minLat},${minLng},${maxLat},${maxLng}`;

    let query = '[out:json][timeout:25];\n(\n';

    // Determine which OSM tags to query based on filters
    const tagsToQuery = this.getRelevantTags(filters);

    for (const [key, values] of Object.entries(tagsToQuery)) {
      for (const value of values) {
        query += `  node["${key}"="${value}"](${bboxString});\n`;
        query += `  way["${key}"="${value}"](${bboxString});\n`;
      }
    }

    query += ');\nout body;\n>;out skel qt;';

    return query;
  }

  private static getRelevantTags(filters: string[]): Record<string, string[]> {
    // Map filters to OSM tags
    const filterTagMap: Record<string, string[]> = {
      'cultural-historical': ['tourism', 'historic'],
      'nature-outdoor': ['natural', 'leisure'],
      'modern-urban': ['amenity', 'building'],
      'culinary': ['amenity'],
      'active-sports': ['leisure'],
      'creative-arts': ['tourism', 'amenity'],
      'educational': ['amenity', 'tourism'],
      'relaxing': ['leisure', 'natural'],
      'family-friendly': ['leisure', 'tourism'],
      'adventurous': ['tourism', 'natural'],
    };

    if (filters.length === 0) {
      // Return all tags if no filters
      return OSM_TAGS;
    }

    const result: Record<string, string[]> = {};

    for (const filter of filters) {
      const tagKeys = filterTagMap[filter] || [];
      for (const key of tagKeys) {
        if (OSM_TAGS[key as keyof typeof OSM_TAGS]) {
          result[key] = OSM_TAGS[key as keyof typeof OSM_TAGS];
        }
      }
    }

    return result;
  }

  private static processOSMData(elements: OSMElement[]): any[] {
    const pois: any[] = [];

    for (const element of elements) {
      // Skip elements without tags
      if (!element.tags || Object.keys(element.tags).length === 0) {
        continue;
      }

      // Get coordinates
      let lat: number, lon: number;

      if (element.type === 'node' && element.lat && element.lon) {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        continue; // Skip if no coordinates
      }

      // Extract name
      const name =
        element.tags.name ||
        element.tags['name:en'] ||
        element.tags['name:nl'] ||
        'Unknown Place';

      const poi = {
        osmId: `${element.type}/${element.id}`,
        name,
        location: {
          lat,
          lng: lon,
        },
        tags: element.tags,
        type: this.determineType(element.tags),
        openingHours: element.tags.opening_hours,
        website: element.tags.website,
        phone: element.tags.phone,
      };

      pois.push(poi);
    }

    return pois;
  }

  private static determineType(tags: Record<string, string>): string {
    // Determine primary type based on tags
    if (tags.tourism) return tags.tourism;
    if (tags.historic) return tags.historic;
    if (tags.leisure) return tags.leisure;
    if (tags.amenity) return tags.amenity;
    if (tags.natural) return tags.natural;
    if (tags.building) return tags.building;
    return 'unknown';
  }

  static async getOpeningHours(osmId: string): Promise<string | null> {
    // Query specific POI for opening hours
    const [type, id] = osmId.split('/');

    const query = `
      [out:json];
      ${type}(${id});
      out body;
    `;

    try {
      const response = await fetch(config.externalApis.overpassUrl, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        return data.elements[0].tags?.opening_hours || null;
      }

      return null;
    } catch (error) {
      logger.error('Error fetching opening hours:', error);
      return null;
    }
  }
}
