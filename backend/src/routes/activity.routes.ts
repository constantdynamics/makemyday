import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createRateLimiter } from '../middleware/rateLimit';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const generateActivitySchema = Joi.object({
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  transport: Joi.string().valid('WALKING', 'CYCLING', 'DRIVING').required(),
  time: Joi.number().min(60).max(960).required(),
  groupSize: Joi.number().min(1).max(5).required(),
  filters: Joi.array().items(Joi.string()),
  excludeIds: Joi.array().items(Joi.string()),
});

const rateActivitySchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
});

router.use(authenticate);

router.post(
  '/generate',
  validate(generateActivitySchema),
  createRateLimiter('ACTIVITY_GENERATION'),
  asyncHandler(ActivityController.generateActivity)
);

router.get('/:activityId', asyncHandler(ActivityController.getActivity));
router.post('/:activityId/rate', validate(rateActivitySchema), asyncHandler(ActivityController.rateActivity));

export default router;
