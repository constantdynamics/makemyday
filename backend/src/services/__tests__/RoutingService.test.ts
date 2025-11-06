import { RoutingService } from '../RoutingService';
import { TransportMode } from '@makemyday/shared';
import { redis } from '../../database/connection';

// Mock dependencies
jest.mock('node-fetch');
jest.mock('../../database/connection');

const mockFetch = require('node-fetch');
const mockRedis = redis as jest.Mocked<typeof redis>;

describe('RoutingService', () => {
  const mockOrigin = { lat: 52.3676, lng: 4.9041 };
  const mockDestination = { lat: 52.3702, lng: 4.8952 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRoute', () => {
    it('should calculate route successfully', async () => {
      const mockRouteResponse = {
        routes: [{
          distance: 1234,
          duration: 300,
          geometry: { type: 'LineString', coordinates: [[4.9041, 52.3676], [4.8952, 52.3702]] },
          legs: [{
            steps: [
              { instruction: 'Head north' },
              { instruction: 'Turn right' },
            ]
          }]
        }]
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK' as never);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockRouteResponse,
      });

      const result = await RoutingService.calculateRoute(
        mockOrigin,
        mockDestination,
        TransportMode.WALKING
      );

      expect(result.distance).toBe(1234);
      expect(result.duration).toBe(300);
      expect(result.geometry).toBeDefined();
      expect(result.steps).toHaveLength(2);
    });

    it('should return cached route if available', async () => {
      const cachedRoute = JSON.stringify({
        distance: 1234,
        duration: 300,
        geometry: {},
      });

      mockRedis.get.mockResolvedValue(cachedRoute);

      const result = await RoutingService.calculateRoute(
        mockOrigin,
        mockDestination,
        TransportMode.CYCLING
      );

      expect(result.distance).toBe(1234);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use correct profile for different transport modes', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK' as never);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ routes: [{ distance: 1000, duration: 200, geometry: {}, legs: [{ steps: [] }] }] }),
      });

      await RoutingService.calculateRoute(mockOrigin, mockDestination, TransportMode.WALKING);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/foot/'));

      await RoutingService.calculateRoute(mockOrigin, mockDestination, TransportMode.CYCLING);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/bike/'));

      await RoutingService.calculateRoute(mockOrigin, mockDestination, TransportMode.DRIVING);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/car/'));
    });

    it('should throw error if no route found', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ routes: [] }),
      });

      await expect(
        RoutingService.calculateRoute(mockOrigin, mockDestination, TransportMode.WALKING)
      ).rejects.toThrow('No route found');
    });

    it('should throw error on API failure', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        RoutingService.calculateRoute(mockOrigin, mockDestination, TransportMode.WALKING)
      ).rejects.toThrow('OSRM API error');
    });
  });

  describe('estimateArrivalTime', () => {
    it('should calculate correct arrival time', () => {
      const route = {
        distance: 1000,
        duration: 600, // 10 minutes in seconds
        geometry: {},
      };

      const now = new Date();
      const arrival = RoutingService.estimateArrivalTime(route);

      const diffMinutes = (arrival.getTime() - now.getTime()) / 1000 / 60;

      expect(diffMinutes).toBeGreaterThanOrEqual(9.9);
      expect(diffMinutes).toBeLessThanOrEqual(10.1);
    });
  });

  describe('calculateMultipleRoutes', () => {
    it('should calculate routes to multiple destinations', async () => {
      const destinations = [
        { lat: 52.3702, lng: 4.8952 },
        { lat: 52.3650, lng: 4.9100 },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK' as never);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          routes: [{
            distance: 1000,
            duration: 300,
            geometry: {},
            legs: [{ steps: [] }]
          }]
        }),
      });

      const results = await RoutingService.calculateMultipleRoutes(
        mockOrigin,
        destinations,
        TransportMode.WALKING
      );

      expect(results).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
