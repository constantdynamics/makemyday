/**
 * Format duration in minutes to human-readable string
 * @param minutes Duration in minutes
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Parse opening hours string (simplified version)
 * @param openingHours Opening hours in OSM format
 * @returns Parsed opening hours or null if 24/7
 */
export function parseOpeningHours(openingHours: string): any {
  if (!openingHours || openingHours === '24/7') {
    return null;
  }

  // TODO: Implement full opening_hours parsing
  // For now, return the raw string
  return { raw: openingHours };
}

/**
 * Check if a location is open at a given time
 * @param openingHours Opening hours string
 * @param time Time to check
 * @returns Object with isOpen status and hours available
 */
export function verifyOpeningHours(
  openingHours: string | undefined,
  time: Date
): { isOpen: boolean; hoursAvailable: number; meetsMinimum: boolean } {
  if (!openingHours || openingHours === '24/7') {
    return { isOpen: true, hoursAvailable: Infinity, meetsMinimum: true };
  }

  // TODO: Implement full opening hours verification
  // For MVP, assume open during daytime (8:00-22:00)
  const hour = time.getHours();
  const isOpen = hour >= 8 && hour < 22;
  const hoursAvailable = isOpen ? 22 - hour : 0;

  return {
    isOpen,
    hoursAvailable,
    meetsMinimum: hoursAvailable >= 1.5,
  };
}

/**
 * Add minutes to a date
 * @param date Base date
 * @param minutes Minutes to add
 * @returns New date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Add hours to a date
 * @param date Base date
 * @param hours Hours to add
 * @returns New date
 */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000);
}

/**
 * Add days to a date
 * @param date Base date
 * @param days Days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}
