import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChallengeService } from '../services/ChallengeService';

export class ChallengeController {
  static async getAllChallenges(req: AuthRequest, res: Response) {
    const { category, difficulty, premium } = req.query;

    const filters: any = {};

    if (category) filters.category = category as string;
    if (difficulty) filters.difficulty = parseInt(difficulty as string);
    if (premium !== undefined) filters.premium = premium === 'true';

    const challenges = await ChallengeService.getAllChallenges(filters);

    res.json({
      success: true,
      data: { challenges },
    });
  }

  static async getChallenge(req: AuthRequest, res: Response) {
    const { challengeId } = req.params;

    const challenge = await ChallengeService.getChallengeById(challengeId);

    res.json({
      success: true,
      data: { challenge },
    });
  }
}
