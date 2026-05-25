import { Router } from 'express';
import * as escalationController from '../controllers/escalationController';

const router = Router();

router.get('/', escalationController.getAllEscalations);
router.get('/:id', escalationController.getEscalationById);
router.post('/', escalationController.createEscalation);
router.put('/:id', escalationController.updateEscalation);
router.delete('/:id', escalationController.deleteEscalation);

export default router;
