import { Request, Response, NextFunction } from 'express';
import { redis } from '../database/connection';
import { AppError } from './errorHandler';
import { AuthRequest } from './auth';
import { RATE_LIMITS } from '@makemyday/shared';

interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

export const createRateLimiter = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      // Get user premium status (simplified for now)
      // In production, fetch from database
      const isPremium = req.isPremium || false;

      const limits = isPremium ? RATE_LIMITS.PREMIUM : RATE_LIMITS.FREE;
      const limit = limits[action as keyof typeof limits] as RateLimitConfig;

      if (!limit) {
        return next();
      }

      const key = `ratelimit:${userId}:${action}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, limit.window);
      }

      const remaining = Math.max(0, limit.requests - current);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.requests);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if (current > limit.requests) {
        throw new AppError('Rate limit exceeded', 429);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
