import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const updatePreferencesSchema = Joi.object({
  filters: Joi.array().items(Joi.string()),
  difficulty: Joi.number().min(1).max(5),
  notifications: Joi.object({
    daily: Joi.boolean(),
    community: Joi.boolean(),
    achievements: Joi.boolean(),
  }),
});

router.use(authenticate);

router.get('/profile', asyncHandler(UserController.getProfile));
router.put('/preferences', validate(updatePreferencesSchema), asyncHandler(UserController.updatePreferences));
router.get('/statistics', asyncHandler(UserController.getStatistics));

export default router;
