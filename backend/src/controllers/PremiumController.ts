import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PremiumService } from '../services/PremiumService';
import { AppError } from '../middleware/errorHandler';

export class PremiumController {
  static async startTrial(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    await PremiumService.startTrial(userId);

    res.json({
      success: true,
      data: {
        message: 'Premium trial activated',
        trialDays: 7,
      },
    });
  }

  static async getStatus(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    const isPremium = await PremiumService.isPremiumUser(userId);

    res.json({
      success: true,
      data: { isPremium },
    });
  }

  static async getStatistics(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    const statistics = await PremiumService.getPremiumStatistics(userId);

    res.json({
      success: true,
      data: { statistics },
    });
  }

  static async getDailyMenu(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    // Check premium status
    const isPremium = await PremiumService.isPremiumUser(userId);
    if (!isPremium) {
      throw new AppError('Premium subscription required', 403);
    }

    const preferences = req.body;
    const menu = await PremiumService.generateDailyMenu(userId, preferences);

    res.json({
      success: true,
      data: { menu },
    });
  }

  static async getThemedAdventure(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    // Check premium status
    const isPremium = await PremiumService.isPremiumUser(userId);
    if (!isPremium) {
      throw new AppError('Premium subscription required', 403);
    }

    const adventure = await PremiumService.generateThemedAdventure(req.body);

    res.json({
      success: true,
      data: { adventure },
    });
  }

  static async createVacationPlan(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    // Check premium status
    const isPremium = await PremiumService.isPremiumUser(userId);
    if (!isPremium) {
      throw new AppError('Premium subscription required', 403);
    }

    const plan = await PremiumService.createVacationPlan(userId, req.body.destination, req.body.duration);

    res.json({
      success: true,
      data: { plan },
    });
  }
}
