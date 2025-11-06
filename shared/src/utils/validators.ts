import { GeoLocation } from '../types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(location: GeoLocation): boolean {
  return (
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
}

/**
 * Validate time range (in minutes)
 */
export function isValidTimeRange(minutes: number): boolean {
  return minutes >= 60 && minutes <= 960; // 1-16 hours
}

/**
 * Validate group size
 */
export function isValidGroupSize(size: number): boolean {
  return size >= 1 && size <= 5;
}

/**
 * Validate rating
 */
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5;
}

/**
 * Validate difficulty level
 */
export function isValidDifficulty(difficulty: number): boolean {
  return difficulty >= 1 && difficulty <= 5;
}
