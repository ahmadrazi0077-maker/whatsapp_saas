import { Router } from 'express';
import { ContactsController } from './contacts.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const contactsController = new ContactsController();

router.use(authenticate);

router.get('/', contactsController.getAllContacts);
router.post('/', contactsController.createContact);
router.put('/:id', contactsController.updateContact);
router.delete('/:id', contactsController.deleteContact);

export default router;