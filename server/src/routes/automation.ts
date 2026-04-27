import { Router } from 'express';
import { AutomationController } from '../controllers/automationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const automationController = new AutomationController();

router.get('/rules', authenticate, automationController.getRules);
router.post('/rules', authenticate, automationController.createRule);
router.put('/rules/:ruleId', authenticate, automationController.updateRule);
router.delete('/rules/:ruleId', authenticate, automationController.deleteRule);

export default router;
