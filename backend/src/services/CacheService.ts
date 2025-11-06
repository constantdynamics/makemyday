import { redis as redisClient } from '../database/connection';
import { logger } from '../utils/logger';

/**
 * Enhanced caching service with performance optimizations
 */
export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds
  private static readonly KEY_PREFIX = 'mmd:';

  /**
   * Get a cached value with type safety
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const cached = await redisClient.get(prefixedKey);

      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set a cached value with optional TTL
   */
  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serialized = JSON.stringify(value);

      if (ttl > 0) {
        await redisClient.setex(prefixedKey, ttl, serialized);
      } else {
        await redisClient.set(prefixedKey, serialized);
      }

      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get or compute: fetch from cache or execute function and cache result
   */
  static async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute the value
    const value = await computeFn();

    // Cache the result (fire and forget)
    this.set(key, value, ttl).catch((error) => {
      logger.warn('Failed to cache computed value:', error);
    });

    return value;
  }

  /**
   * Delete a cached value
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      await redisClient.del(prefixedKey);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    try {
      const prefixedPattern = this.getPrefixedKey(pattern);
      const keys = await redisClient.keys(prefixedPattern);

      if (keys.length === 0) {
        return 0;
      }

      await redisClient.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error('Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const result = await redisClient.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Increment a counter
   */
  static async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      return await redisClient.incrby(prefixedKey, amount);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Set with expiry (convenience method)
   */
  static async setWithExpiry(key: string, value: any, seconds: number): Promise<boolean> {
    return this.set(key, value, seconds);
  }

  /**
   * Get TTL of a key
   */
  static async getTTL(key: string): Promise<number> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      return await redisClient.ttl(prefixedKey);
    } catch (error) {
      logger.error('Cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Batch get multiple keys
   */
  static async mget<T>(keys: string[]): Promise<Array<T | null>> {
    try {
      const prefixedKeys = keys.map((key) => this.getPrefixedKey(key));
      const results = await redisClient.mget(...prefixedKeys);

      return results.map((result) => {
        if (!result) return null;
        try {
          return JSON.parse(result) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Batch set multiple keys
   */
  static async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
    try {
      const pipeline = redisClient.pipeline();

      for (const entry of entries) {
        const prefixedKey = this.getPrefixedKey(entry.key);
        const serialized = JSON.stringify(entry.value);

        if (entry.ttl && entry.ttl > 0) {
          pipeline.setex(prefixedKey, entry.ttl, serialized);
        } else {
          pipeline.set(prefixedKey, serialized);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  static async clear(): Promise<boolean> {
    try {
      const keys = await redisClient.keys(`${this.KEY_PREFIX}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      logger.info(`Cleared ${keys.length} cache keys`);
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    totalKeys: number;
    memoryUsed: string;
    hitRate?: number;
  }> {
    try {
      const keys = await redisClient.keys(`${this.KEY_PREFIX}*`);
      const info = await redisClient.info('memory');

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        totalKeys: keys.length,
        memoryUsed,
      };
    } catch (error) {
      logger.error('Cache getStats error:', error);
      return {
        totalKeys: 0,
        memoryUsed: 'unknown',
      };
    }
  }

  /**
   * Helper: Get prefixed key
   */
  private static getPrefixedKey(key: string): string {
    return `${this.KEY_PREFIX}${key}`;
  }

  /**
   * Cache key generators for common patterns
   */
  static keys = {
    user: (userId: string) => `user:${userId}`,
    userStats: (userId: string) => `user:${userId}:stats`,
    session: (sessionId: string) => `session:${sessionId}`,
    userSessions: (userId: string) => `user:${userId}:sessions`,
    activity: (activityId: string) => `activity:${activityId}`,
    osmPoi: (lat: number, lon: number, radius: number) =>
      `osm:poi:${lat.toFixed(4)}:${lon.toFixed(4)}:${radius}`,
    route: (from: string, to: string, mode: string) =>
      `route:${mode}:${from}:${to}`,
    dailyMenu: (userId: string, date: string) =>
      `daily-menu:${userId}:${date}`,
    premiumStatus: (userId: string) => `premium:${userId}`,
    challengePool: (filters: string) => `challenges:${filters}`,
  };
}

export default CacheService;
