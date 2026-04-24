import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsappController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const whatsappController = new WhatsAppController();

router.use(authenticate);
router.post('/connect', whatsappController.connect);
router.get('/devices', whatsappController.getDevices);
router.get('/qr/:deviceId', whatsappController.getQR);
router.post('/disconnect/:deviceId', whatsappController.disconnect);
router.post('/send', whatsappController.sendMessage);

export default router;