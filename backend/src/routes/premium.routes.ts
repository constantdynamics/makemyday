import { Router } from 'express';
import { PremiumController } from '../controllers/PremiumController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const dailyMenuSchema = Joi.object({
  preferredDuration: Joi.number().min(60).max(480).default(180),
  preferredTransport: Joi.string().valid('WALKING', 'CYCLING', 'DRIVING').default('WALKING'),
  preferredTime: Joi.string().valid('MORNING', 'AFTERNOON', 'EVENING').default('AFTERNOON'),
});

const themedAdventureSchema = Joi.object({
  theme: Joi.string()
    .valid('historical-tour', 'culinary-tour', 'art-culture', 'nature-escape', 'hidden-gems')
    .required(),
  duration: Joi.number().min(120).max(480).required(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
});

const vacationPlanSchema = Joi.object({
  destination: Joi.object({
    country: Joi.string().required(),
    region: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
  }).required(),
  duration: Joi.number().min(1).max(30).required(),
});

router.use(authenticate);

router.post('/trial', asyncHandler(PremiumController.startTrial));
router.get('/status', asyncHandler(PremiumController.getStatus));
router.get('/statistics', asyncHandler(PremiumController.getStatistics));

router.post(
  '/daily-menu',
  validate(dailyMenuSchema),
  asyncHandler(PremiumController.getDailyMenu)
);

router.post(
  '/themed-adventure',
  validate(themedAdventureSchema),
  asyncHandler(PremiumController.getThemedAdventure)
);

router.post(
  '/vacation-plan',
  validate(vacationPlanSchema),
  asyncHandler(PremiumController.createVacationPlan)
);

export default router;
