import { ChallengeModel } from '../database/models/Challenge';
import { AppError } from '../middleware/errorHandler';
import { CreateChallengeDto } from '@makemyday/shared';

interface FindChallengesParams {
  groupSize: number;
  excludeIds: string[];
  isPremium: boolean;
  difficulty: number;
}

export class ChallengeService {
  static async findSuitableChallenges(params: FindChallengesParams): Promise<any[]> {
    const query: any = {
      'requirements.minGroupSize': { $lte: params.groupSize },
      'requirements.maxGroupSize': { $gte: params.groupSize },
      _id: { $nin: params.excludeIds },
      active: true,
      difficulty: { $lte: params.difficulty + 1 }, // Allow slightly harder
    };

    // Filter by premium status
    if (!params.isPremium) {
      query.premium = false;
    }

    const challenges = await ChallengeModel.find(query).limit(20).lean();

    return challenges;
  }

  static async getChallengeById(id: string): Promise<any> {
    const challenge = await ChallengeModel.findById(id);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    return challenge;
  }

  static async createChallenge(data: CreateChallengeDto): Promise<any> {
    const challenge = await ChallengeModel.create(data);
    return challenge;
  }

  static async getAllChallenges(filters?: {
    category?: string;
    difficulty?: number;
    premium?: boolean;
  }): Promise<any[]> {
    const query: any = { active: true };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters?.premium !== undefined) {
      query.premium = filters.premium;
    }

    const challenges = await ChallengeModel.find(query).lean();

    return challenges;
  }

  static async updateChallengeStats(challengeId: string, rating: number): Promise<void> {
    const challenge = await ChallengeModel.findById(challengeId);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    // Update statistics
    const totalRatings = challenge.timesCompleted;
    const currentTotal = challenge.averageRating * totalRatings;
    const newTotal = currentTotal + rating;
    const newCount = totalRatings + 1;

    challenge.averageRating = newTotal / newCount;
    challenge.timesCompleted += 1;

    await challenge.save();
  }
}
