import fetch from 'node-fetch';
import { config } from '../config';
import { GeoLocation, TransportMode } from '@makemyday/shared';
import { logger } from '../utils/logger';
import { redis } from '../database/connection';

interface Route {
  distance: number; // meters
  duration: number; // seconds
  geometry: any; // GeoJSON
  steps?: any[];
}

export class RoutingService {
  private static CACHE_TTL = 3600; // 1 hour

  static async calculateRoute(
    origin: GeoLocation,
    destination: GeoLocation,
    mode: TransportMode
  ): Promise<Route> {
    const cacheKey = `route:${origin.lat}:${origin.lng}:${destination.lat}:${destination.lng}:${mode}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Map transport mode to OSRM profile
    const profile = this.getOSRMProfile(mode);

    const url = `${config.externalApis.osrmUrl}/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const osrmRoute = data.routes[0];

      const route: Route = {
        distance: osrmRoute.distance,
        duration: osrmRoute.duration,
        geometry: osrmRoute.geometry,
        steps: osrmRoute.legs[0].steps,
      };

      // Cache result
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(route));

      return route;
    } catch (error) {
      logger.error('Routing error:', error);
      throw error;
    }
  }

  private static getOSRMProfile(mode: TransportMode): string {
    switch (mode) {
      case TransportMode.WALKING:
        return 'foot';
      case TransportMode.CYCLING:
        return 'bike';
      case TransportMode.DRIVING:
        return 'car';
      default:
        return 'foot';
    }
  }

  static async calculateMultipleRoutes(
    origin: GeoLocation,
    destinations: GeoLocation[],
    mode: TransportMode
  ): Promise<Route[]> {
    const promises = destinations.map((dest) => this.calculateRoute(origin, dest, mode));

    return await Promise.all(promises);
  }

  static estimateArrivalTime(route: Route): Date {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + route.duration * 1000);
    return arrivalTime;
  }
}
