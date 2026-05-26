import { Router } from 'express';
import * as revisionSummaryController from '../controllers/revisionSummaryController';

const router = Router();

router.get('/', revisionSummaryController.getAllRevisionSummaries);
router.get('/:id', revisionSummaryController.getRevisionSummaryById);
router.post('/', revisionSummaryController.createRevisionSummary);
router.put('/:id', revisionSummaryController.updateRevisionSummary);
router.delete('/:id', revisionSummaryController.deleteRevisionSummary);

export default router;
