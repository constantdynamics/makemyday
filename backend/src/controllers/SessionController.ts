import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SessionService } from '../services/SessionService';
import { pgPool } from '../database/connection';

export class SessionController {
  static async createSession(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    // Check if user is premium
    const userResult = await pgPool.query('SELECT is_premium FROM users WHERE id = $1', [userId]);
    const isPremium = userResult.rows[0]?.is_premium || false;

    const session = await SessionService.createSession(userId, req.body, isPremium);

    res.status(201).json({
      success: true,
      data: { session },
    });
  }

  static async getSession(req: AuthRequest, res: Response) {
    const { sessionId } = req.params;
    const userId = req.userId!;

    const session = await SessionService.getSession(sessionId, userId);

    res.json({
      success: true,
      data: { session },
    });
  }

  static async getUserSessions(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;

    const sessions = await SessionService.getUserSessions(userId, limit);

    res.json({
      success: true,
      data: { sessions },
    });
  }

  static async completeActivity(req: AuthRequest, res: Response) {
    const { sessionId, activityId } = req.params;
    const userId = req.userId!;

    await SessionService.completeActivity(sessionId, userId, activityId, req.body);

    res.json({
      success: true,
      data: { message: 'Activity completed' },
    });
  }

  static async skipActivity(req: AuthRequest, res: Response) {
    const { sessionId, activityId } = req.params;
    const userId = req.userId!;

    await SessionService.skipActivity(sessionId, userId, activityId);

    res.json({
      success: true,
      data: { message: 'Activity skipped' },
    });
  }

  static async completeSession(req: AuthRequest, res: Response) {
    const { sessionId } = req.params;
    const userId = req.userId!;

    await SessionService.completeSession(sessionId, userId);

    res.json({
      success: true,
      data: { message: 'Session completed' },
    });
  }
}
