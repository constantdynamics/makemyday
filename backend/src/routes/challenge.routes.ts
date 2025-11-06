import { Router } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', optionalAuth, asyncHandler(ChallengeController.getAllChallenges));
router.get('/:challengeId', asyncHandler(ChallengeController.getChallenge));

export default router;
