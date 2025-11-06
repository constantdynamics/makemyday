import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import activityRoutes from './activity.routes';
import challengeRoutes from './challenge.routes';
import userRoutes from './user.routes';
import premiumRoutes from './premium.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/activities', activityRoutes);
router.use('/challenges', challengeRoutes);
router.use('/user', userRoutes);
router.use('/premium', premiumRoutes);

export default router;
