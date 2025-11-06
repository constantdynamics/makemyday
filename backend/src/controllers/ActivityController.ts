import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ActivityService } from '../services/ActivityService';
import { GenerateActivityDto } from '@makemyday/shared';
import { pgPool } from '../database/connection';

export class ActivityController {
  static async generateActivity(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    // Check if user is premium
    const userResult = await pgPool.query('SELECT is_premium FROM users WHERE id = $1', [userId]);
    const isPremium = userResult.rows[0]?.is_premium || false;

    const data: GenerateActivityDto = {
      ...req.body,
      isPremium,
    };

    const suggestion = await ActivityService.generateSuggestion(data);

    res.json({
      success: true,
      data: { suggestion },
    });
  }

  static async getActivity(req: AuthRequest, res: Response) {
    const { activityId } = req.params;

    // Try MongoDB first (for challenges and cached POIs)
    const { ActivityModel } = await import('../database/models/Activity');
    const activity = await ActivityModel.findById(activityId);

    res.json({
      success: true,
      data: { activity },
    });
  }

  static async rateActivity(req: AuthRequest, res: Response) {
    const { activityId } = req.params;
    const { rating } = req.body;

    await ActivityService.rateActivity(activityId, rating);

    res.json({
      success: true,
      data: { message: 'Activity rated successfully' },
    });
  }
}
