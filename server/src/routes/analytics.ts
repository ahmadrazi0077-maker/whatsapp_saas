import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);

export default router;
