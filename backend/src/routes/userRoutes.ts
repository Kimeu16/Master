import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireCrudOrAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireCrudOrAdmin, userController.createUser);
router.put('/:id', requireCrudOrAdmin, userController.updateUser);
router.delete('/:id', requireCrudOrAdmin, userController.deleteUser);

export default router;
