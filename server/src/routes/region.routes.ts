import { Router } from 'express';
import { RegionController } from '../../server/src/controllers/region.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const regionController = new RegionController();

// Public routes
router.get('/detect', regionController.detectRegion);
router.get('/list', regionController.getAllRegions);
router.get('/:code', regionController.getRegionByCode);

// Protected routes
router.use(authenticate);
router.post('/set-preference', regionController.setUserRegionPreference);
router.get('/user/preference', regionController.getUserRegionPreference);
router.get('/pricing/:planId', regionController.getRegionalPricing);

export default router;