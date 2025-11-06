import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import activityRoutes from './activity.routes';
import challengeRoutes from './challenge.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/activities', activityRoutes);
router.use('/challenges', challengeRoutes);
router.use('/user', userRoutes);

export default router;
