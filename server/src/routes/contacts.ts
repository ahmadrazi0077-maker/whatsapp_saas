import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { authenticate } from '../middleware/auth';

const router = Router();
const contactController = new ContactController();

router.get('/', authenticate, contactController.getContacts);
router.get('/:id', authenticate, contactController.getContact);
router.post('/', authenticate, contactController.createContact);
router.put('/:id', authenticate, contactController.updateContact);
router.delete('/:id', authenticate, contactController.deleteContact);
router.post('/bulk-delete', authenticate, contactController.bulkDelete);
router.post('/import', authenticate, contactController.importContacts);

export default router;
