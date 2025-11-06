import { formatDuration, addMinutes, addHours, addDays } from '../time';

describe('Time Utilities', () => {
  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours only', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(180)).toBe('3h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(135)).toBe('2h 15m');
      expect(formatDuration(195)).toBe('3h 15m');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0m');
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to a date', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = addMinutes(date, 30);

      expect(result.getTime()).toBe(date.getTime() + 30 * 60000);
    });

    it('should handle negative minutes', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = addMinutes(date, -30);

      expect(result.getTime()).toBe(date.getTime() - 30 * 60000);
    });
  });

  describe('addHours', () => {
    it('should add hours to a date', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = addHours(date, 2);

      expect(result.getTime()).toBe(date.getTime() + 2 * 3600000);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = addDays(date, 7);

      expect(result.getTime()).toBe(date.getTime() + 7 * 86400000);
    });
  });
});
