import { Router } from 'express';
import * as pmChecklistController from '../controllers/pmChecklistController';

const router = Router();

router.get('/', pmChecklistController.getAllPMChecklists);
router.get('/:id', pmChecklistController.getPMChecklistById);
router.post('/', pmChecklistController.createPMChecklist);
router.put('/:id', pmChecklistController.updatePMChecklist);
router.delete('/:id', pmChecklistController.deletePMChecklist);

export default router;
