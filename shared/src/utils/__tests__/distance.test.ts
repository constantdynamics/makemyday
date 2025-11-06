import { calculateDistance, calculateMaxDistance, calculateBoundingBox, formatDistance } from '../distance';

describe('Distance Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const point1 = { lat: 52.3676, lng: 4.9041 }; // Amsterdam
      const point2 = { lat: 52.3702, lng: 4.8952 }; // Nearby location

      const distance = calculateDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1000); // Should be less than 1km
    });

    it('should return 0 for same location', () => {
      const point = { lat: 52.3676, lng: 4.9041 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should calculate long distances correctly', () => {
      const amsterdam = { lat: 52.3676, lng: 4.9041 };
      const paris = { lat: 48.8566, lng: 2.3522 };

      const distance = calculateDistance(amsterdam, paris);

      // Approximate distance Amsterdam-Paris is ~430km
      expect(distance).toBeGreaterThan(400000);
      expect(distance).toBeLessThan(450000);
    });
  });

  describe('calculateMaxDistance', () => {
    it('should calculate max distance for walking speed', () => {
      const speed = 5; // km/h
      const time = 60; // minutes

      const maxDistance = calculateMaxDistance(speed, time);

      expect(maxDistance).toBe(5000); // 5km in meters
    });

    it('should calculate max distance for cycling speed', () => {
      const speed = 20; // km/h
      const time = 30; // minutes

      const maxDistance = calculateMaxDistance(speed, time);

      expect(maxDistance).toBe(10000); // 10km in meters
    });

    it('should handle zero time', () => {
      const speed = 20;
      const time = 0;

      const maxDistance = calculateMaxDistance(speed, time);

      expect(maxDistance).toBe(0);
    });
  });

  describe('calculateBoundingBox', () => {
    it('should create bounding box around center point', () => {
      const center = { lat: 52.3676, lng: 4.9041 };
      const radius = 1000; // 1km

      const [minLat, minLng, maxLat, maxLng] = calculateBoundingBox(center, radius);

      expect(minLat).toBeLessThan(center.lat);
      expect(maxLat).toBeGreaterThan(center.lat);
      expect(minLng).toBeLessThan(center.lng);
      expect(maxLng).toBeGreaterThan(center.lng);
    });

    it('should create larger box for larger radius', () => {
      const center = { lat: 52.3676, lng: 4.9041 };

      const [minLat1, minLng1, maxLat1, maxLng1] = calculateBoundingBox(center, 1000);
      const [minLat2, minLng2, maxLat2, maxLng2] = calculateBoundingBox(center, 5000);

      const size1 = (maxLat1 - minLat1) * (maxLng1 - minLng1);
      const size2 = (maxLat2 - minLat2) * (maxLng2 - minLng2);

      expect(size2).toBeGreaterThan(size1);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(12345)).toBe('12.3 km');
    });

    it('should handle zero', () => {
      expect(formatDistance(0)).toBe('0 m');
    });
  });
});
