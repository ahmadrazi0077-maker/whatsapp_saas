import { Router } from 'express';
import { DevicesController } from './devices.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const devicesController = new DevicesController();

router.use(authenticate);

router.get('/', devicesController.getAllDevices);
router.get('/:id', devicesController.getDeviceById);
router.post('/connect', devicesController.connectDevice);
router.get('/:id/qr', devicesController.refreshQRCode);
router.post('/:id/disconnect', devicesController.disconnectDevice);
router.post('/:id/send', devicesController.sendMessage);

export default router;