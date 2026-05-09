import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/messages', analyticsController.getMessageStats);

export default router;