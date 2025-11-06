import { pgPool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ActivityService } from './ActivityService';
import { ChallengeService } from './ChallengeService';
import { redis } from '../database/connection';
import { addDays } from '@makemyday/shared';

interface DailyMenuPreferences {
  preferredDuration: number; // minutes
  preferredTransport: string;
  preferredTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

interface ThemedAdventureConfig {
  theme: string;
  duration: number; // minutes
  location: { lat: number; lng: number };
}

export class PremiumService {
  /**
   * Check if user has active premium subscription
   */
  static async isPremiumUser(userId: string): Promise<boolean> {
    try {
      const result = await pgPool.query(
        `SELECT is_premium, premium_expiry_date
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const user = result.rows[0];

      if (!user.is_premium) {
        return false;
      }

      // Check expiry date
      if (user.premium_expiry_date && new Date(user.premium_expiry_date) < new Date()) {
        // Expired - update user
        await this.deactivatePremium(userId);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Start premium trial (7 days)
   */
  static async startTrial(userId: string): Promise<void> {
    // Check if trial already used
    const existingTrial = await pgPool.query(
      'SELECT id FROM premium_trials WHERE user_id = $1',
      [userId]
    );

    if (existingTrial.rows.length > 0) {
      throw new AppError('Trial already used', 400);
    }

    const trialEndDate = addDays(new Date(), 7);

    // Create trial record
    await pgPool.query(
      `INSERT INTO premium_trials (user_id, start_date, end_date)
       VALUES ($1, CURRENT_TIMESTAMP, $2)`,
      [userId, trialEndDate]
    );

    // Activate premium
    await pgPool.query(
      `UPDATE users
       SET is_premium = TRUE,
           premium_type = 'TRIAL',
           premium_start_date = CURRENT_TIMESTAMP,
           premium_expiry_date = $2
       WHERE id = $1`,
      [userId, trialEndDate]
    );

    logger.info(`Premium trial started for user ${userId}`);
  }

  /**
   * Activate premium subscription
   */
  static async activatePremium(
    userId: string,
    subscriptionType: 'MONTHLY' | 'YEARLY'
  ): Promise<void> {
    const durationDays = subscriptionType === 'MONTHLY' ? 30 : 365;
    const expiryDate = addDays(new Date(), durationDays);

    await pgPool.query(
      `UPDATE users
       SET is_premium = TRUE,
           premium_type = $2,
           premium_start_date = CURRENT_TIMESTAMP,
           premium_expiry_date = $3,
           premium_auto_renew = TRUE
       WHERE id = $1`,
      [userId, subscriptionType, expiryDate]
    );

    logger.info(`Premium activated for user ${userId} - ${subscriptionType}`);
  }

  /**
   * Deactivate premium subscription
   */
  static async deactivatePremium(userId: string): Promise<void> {
    await pgPool.query(
      `UPDATE users
       SET is_premium = FALSE,
           premium_type = NULL,
           premium_expiry_date = NULL
       WHERE id = $1`,
      [userId]
    );

    logger.info(`Premium deactivated for user ${userId}`);
  }

  /**
   * Generate daily discovery menu (3 suggestions)
   */
  static async generateDailyMenu(
    userId: string,
    preferences: DailyMenuPreferences
  ): Promise<any[]> {
    const cacheKey = `daily_menu:${userId}:${new Date().toISOString().split('T')[0]}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get user homebase or current location
    const userResult = await pgPool.query(
      'SELECT ST_X(homebase_location::geometry) as lng, ST_Y(homebase_location::geometry) as lat FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].lat) {
      throw new AppError('User location not available', 400);
    }

    const location = {
      lat: userResult.rows[0].lat,
      lng: userResult.rows[0].lng,
    };

    // Generate 3 diverse suggestions
    const suggestions = [];
    const excludeIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      try {
        const suggestion = await ActivityService.generateSuggestion({
          location,
          transport: preferences.preferredTransport,
          time: preferences.preferredDuration,
          groupSize: 2, // Default
          excludeIds,
          isPremium: true,
        });

        suggestions.push(suggestion);
        excludeIds.push(suggestion.activity.id);
      } catch (error) {
        logger.error('Error generating daily menu suggestion:', error);
        // Continue with remaining suggestions
      }
    }

    // Cache for 24 hours
    await redis.setex(cacheKey, 86400, JSON.stringify(suggestions));

    logger.info(`Daily menu generated for user ${userId} with ${suggestions.length} suggestions`);

    return suggestions;
  }

  /**
   * Generate themed adventure (sequence of related activities)
   */
  static async generateThemedAdventure(config: ThemedAdventureConfig): Promise<any> {
    const { theme, duration, location } = config;

    // Theme configurations
    const themeConfigs: Record<string, any> = {
      'historical-tour': {
        filters: ['cultural-historical'],
        tags: ['historic', 'monument', 'castle'],
        minActivities: 3,
      },
      'culinary-tour': {
        filters: ['culinary'],
        tags: ['restaurant', 'cafe', 'food'],
        minActivities: 3,
      },
      'art-culture': {
        filters: ['creative-arts', 'cultural-historical'],
        tags: ['museum', 'gallery', 'theatre'],
        minActivities: 3,
      },
      'nature-escape': {
        filters: ['nature-outdoor'],
        tags: ['park', 'nature', 'garden'],
        minActivities: 3,
      },
      'hidden-gems': {
        filters: ['adventurous'],
        tags: ['hidden', 'secret', 'underground'],
        minActivities: 4,
      },
    };

    const themeConfig = themeConfigs[theme] || themeConfigs['hidden-gems'];

    // Generate sequence of activities
    const activities = [];
    let remainingTime = duration;
    const excludeIds: string[] = [];

    while (remainingTime > 60 && activities.length < 6) {
      try {
        const activity = await ActivityService.generateSuggestion({
          location: activities.length > 0
            ? {
                lat: activities[activities.length - 1].activity.location.coordinates[1],
                lng: activities[activities.length - 1].activity.location.coordinates[0],
              }
            : location,
          transport: 'WALKING',
          time: Math.min(remainingTime, 180),
          groupSize: 2,
          filters: themeConfig.filters,
          excludeIds,
          isPremium: true,
        });

        activities.push(activity);
        excludeIds.push(activity.activity.id);
        remainingTime -= activity.activity.estimatedDuration.max + (activity.route.duration / 60);
      } catch (error) {
        logger.error('Error generating themed adventure activity:', error);
        break;
      }
    }

    if (activities.length < themeConfig.minActivities) {
      throw new AppError(`Could not generate enough activities for ${theme} theme`, 400);
    }

    return {
      theme,
      totalActivities: activities.length,
      estimatedDuration: duration - remainingTime,
      activities,
    };
  }

  /**
   * Create vacation plan
   */
  static async createVacationPlan(
    userId: string,
    destination: {
      country: string;
      region: string;
      location: { lat: number; lng: number };
    },
    duration: number // days
  ): Promise<any> {
    // Check usage limit (2x per year)
    const currentYear = new Date().getFullYear();
    const usageResult = await pgPool.query(
      `SELECT COUNT(*) as count
       FROM vacation_plans
       WHERE user_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2`,
      [userId, currentYear]
    );

    if (parseInt(usageResult.rows[0].count) >= 2) {
      throw new AppError('Vacation explorer limit reached for this year (2 max)', 400);
    }

    // Generate bucketlist of activities
    const bucketlist = [];
    const excludeIds: string[] = [];

    // Generate diverse activities for the destination
    for (let i = 0; i < 20; i++) {
      try {
        const activity = await ActivityService.generateSuggestion({
          location: destination.location,
          transport: 'WALKING',
          time: 180,
          groupSize: 2,
          excludeIds,
          isPremium: true,
        });

        bucketlist.push({
          activity: activity.activity,
          priority: i < 10 ? 'HIGH' : 'MEDIUM',
          saved: false,
        });

        excludeIds.push(activity.activity.id);
      } catch (error) {
        logger.error('Error generating vacation activity:', error);
        // Continue with remaining activities
      }
    }

    // Create vacation plan
    const result = await pgPool.query(
      `INSERT INTO vacation_plans
       (user_id, destination_country, destination_region, destination_location, duration, status)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, 'PLANNING')
       RETURNING *`,
      [userId, destination.country, destination.region, destination.location.lng, destination.location.lat, duration]
    );

    logger.info(`Vacation plan created for user ${userId} - ${destination.country}`);

    return {
      id: result.rows[0].id,
      destination,
      duration,
      bucketlist,
      status: 'PLANNING',
    };
  }

  /**
   * Get user premium statistics
   */
  static async getPremiumStatistics(userId: string): Promise<any> {
    const result = await pgPool.query(
      `SELECT
        u.total_sessions,
        u.total_activities,
        u.total_distance,
        u.total_time,
        u.average_rating,
        u.premium_start_date,
        COUNT(DISTINCT s.id) as sessions_since_premium
       FROM users u
       LEFT JOIN sessions s ON s.user_id = u.id AND s.started_at >= u.premium_start_date
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }
}
