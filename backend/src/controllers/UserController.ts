import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pgPool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    const result = await pgPool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: {
            displayName: user.display_name,
            avatar: user.avatar,
            language: user.language,
            country: user.country,
          },
          premium: {
            status: user.is_premium,
            type: user.premium_type,
            expiryDate: user.premium_expiry_date,
          },
          preferences: user.preferences,
        },
      },
    });
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const preferences = req.body;

    await pgPool.query(
      `UPDATE users
       SET preferences = preferences || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify(preferences), userId]
    );

    res.json({
      success: true,
      data: { message: 'Preferences updated' },
    });
  }

  static async getStatistics(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    const result = await pgPool.query(
      `SELECT total_sessions, total_activities, total_distance, total_time, average_rating
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { statistics: result.rows[0] },
    });
  }
}
