// server/src/routes/devices.ts (or whatsapp.ts)
import { Router } from 'express';
import { getDevices, connectDevice } from '../controllers/whatsappController';
import { authenticate } from '../middleware/auth'; // Your JWT auth middleware

const router = Router();

// Notice we use the auth middleware here to prevent 401 errors!
router.get('/', authenticate, getDevices);
router.post('/connect', authenticate, connectDevice);

export default router;
