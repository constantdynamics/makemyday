import { GeoLocation } from '../types';

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First location
 * @param point2 Second location
 * @returns Distance in meters
 */
export function calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate maximum distance based on transport mode and time
 * @param transportSpeed Speed in km/h
 * @param timeMinutes Available time in minutes
 * @returns Maximum distance in meters
 */
export function calculateMaxDistance(transportSpeed: number, timeMinutes: number): number {
  return (transportSpeed * timeMinutes * 1000) / 60; // Convert to meters
}

/**
 * Calculate bounding box for a given center point and radius
 * @param center Center point
 * @param radiusMeters Radius in meters
 * @returns Bounding box [minLat, minLng, maxLat, maxLng]
 */
export function calculateBoundingBox(
  center: GeoLocation,
  radiusMeters: number
): [number, number, number, number] {
  const latDelta = (radiusMeters / 111320); // 1 degree latitude ≈ 111.32 km
  const lngDelta = radiusMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));

  return [
    center.lat - latDelta, // minLat
    center.lng - lngDelta, // minLng
    center.lat + latDelta, // maxLat
    center.lng + lngDelta, // maxLng
  ];
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "1.5 km" or "500 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
