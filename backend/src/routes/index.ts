import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import chatRoutes from '../modules/chat/chat.routes';
import contactsRoutes from '../modules/contacts/contacts.routes';
import devicesRoutes from '../modules/devices/devices.routes';
import broadcastRoutes from '../modules/broadcast/broadcast.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/contacts', contactsRoutes);
router.use('/devices', devicesRoutes);
router.use('/broadcasts', broadcastRoutes);
router.use('/analytics', analyticsRoutes);
