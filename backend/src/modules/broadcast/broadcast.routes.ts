import { Router } from 'express';
import { BroadcastController } from './broadcast.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const broadcastController = new BroadcastController();

router.use(authenticate);

router.get('/', broadcastController.getAllBroadcasts);
router.post('/', broadcastController.createBroadcast);
router.post('/:id/send', broadcastController.sendBroadcast);
router.post('/:id/schedule', broadcastController.scheduleBroadcast);

export default router;