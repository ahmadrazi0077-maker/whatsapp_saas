import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();
const messageController = new MessageController();

router.get('/conversations', authenticate, messageController.getConversations);
router.get('/:conversationId', authenticate, messageController.getMessages);
router.post('/send', authenticate, messageController.sendMessage);
router.post('/read/:conversationId', authenticate, messageController.markAsRead);

export default router;
