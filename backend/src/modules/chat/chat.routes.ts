import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const chatController = new ChatController();

router.use(authenticate);

router.get('/', chatController.getAllChats);
router.post('/', chatController.createChat);
router.get('/:id', chatController.getChatById);
router.post('/:id/messages', chatController.sendMessage);

export default router;