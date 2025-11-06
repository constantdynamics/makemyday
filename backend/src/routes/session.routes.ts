import { Router } from 'express';
import { SessionController } from '../controllers/SessionController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const createSessionSchema = Joi.object({
  transport: Joi.string().valid('WALKING', 'CYCLING', 'DRIVING').required(),
  totalTime: Joi.number().min(60).max(960).required(),
  groupSize: Joi.number().min(1).max(5).required(),
  startLocation: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  filters: Joi.array().items(Joi.string()).max(10),
});

const completeActivitySchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  photo: Joi.string().uri(),
  feedback: Joi.string().max(500),
});

router.use(authenticate);

router.post('/', validate(createSessionSchema), asyncHandler(SessionController.createSession));
router.get('/', asyncHandler(SessionController.getUserSessions));
router.get('/:sessionId', asyncHandler(SessionController.getSession));
router.post('/:sessionId/complete', asyncHandler(SessionController.completeSession));

router.post(
  '/:sessionId/activities/:activityId/complete',
  validate(completeActivitySchema),
  asyncHandler(SessionController.completeActivity)
);
router.post(
  '/:sessionId/activities/:activityId/skip',
  asyncHandler(SessionController.skipActivity)
);

export default router;
