import { Router } from 'express';
import { BroadcastController } from '../controllers/broadcastController';
import { authenticate } from '../middleware/auth';

const router = Router();
const broadcastController = new BroadcastController();

router.post('/create', authenticate, broadcastController.createCampaign);
router.get('/campaigns', authenticate, broadcastController.getCampaigns);
router.post('/cancel/:campaignId', authenticate, broadcastController.cancelCampaign);

export default router;
