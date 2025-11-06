import {
  isValidEmail,
  isValidPassword,
  isValidCoordinates,
  isValidTimeRange,
  isValidGroupSize,
  isValidRating,
  isValidDifficulty,
} from '../validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecure1Pass')).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(isValidPassword('password123')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(isValidPassword('PASSWORD123')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(isValidPassword('PasswordOnly')).toBe(false);
    });

    it('should reject passwords too short', () => {
      expect(isValidPassword('Pass1')).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should accept valid coordinates', () => {
      expect(isValidCoordinates({ lat: 52.3676, lng: 4.9041 })).toBe(true);
      expect(isValidCoordinates({ lat: 0, lng: 0 })).toBe(true);
      expect(isValidCoordinates({ lat: -90, lng: -180 })).toBe(true);
      expect(isValidCoordinates({ lat: 90, lng: 180 })).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates({ lat: 91, lng: 0 })).toBe(false);
      expect(isValidCoordinates({ lat: 0, lng: 181 })).toBe(false);
      expect(isValidCoordinates({ lat: -91, lng: 0 })).toBe(false);
    });
  });

  describe('isValidTimeRange', () => {
    it('should accept valid time ranges', () => {
      expect(isValidTimeRange(60)).toBe(true); // 1 hour
      expect(isValidTimeRange(120)).toBe(true); // 2 hours
      expect(isValidTimeRange(960)).toBe(true); // 16 hours
    });

    it('should reject invalid time ranges', () => {
      expect(isValidTimeRange(59)).toBe(false); // Too short
      expect(isValidTimeRange(961)).toBe(false); // Too long
      expect(isValidTimeRange(0)).toBe(false);
    });
  });

  describe('isValidGroupSize', () => {
    it('should accept valid group sizes', () => {
      expect(isValidGroupSize(1)).toBe(true);
      expect(isValidGroupSize(3)).toBe(true);
      expect(isValidGroupSize(5)).toBe(true);
    });

    it('should reject invalid group sizes', () => {
      expect(isValidGroupSize(0)).toBe(false);
      expect(isValidGroupSize(6)).toBe(false);
      expect(isValidGroupSize(-1)).toBe(false);
    });
  });

  describe('isValidRating', () => {
    it('should accept valid ratings', () => {
      expect(isValidRating(1)).toBe(true);
      expect(isValidRating(3)).toBe(true);
      expect(isValidRating(5)).toBe(true);
    });

    it('should reject invalid ratings', () => {
      expect(isValidRating(0)).toBe(false);
      expect(isValidRating(6)).toBe(false);
      expect(isValidRating(2.5)).toBe(true); // Decimals ok
    });
  });

  describe('isValidDifficulty', () => {
    it('should accept valid difficulty levels', () => {
      expect(isValidDifficulty(1)).toBe(true);
      expect(isValidDifficulty(3)).toBe(true);
      expect(isValidDifficulty(5)).toBe(true);
    });

    it('should reject invalid difficulty levels', () => {
      expect(isValidDifficulty(0)).toBe(false);
      expect(isValidDifficulty(6)).toBe(false);
    });
  });
});
