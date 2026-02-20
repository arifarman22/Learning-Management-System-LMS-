import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new UserController();

const adminOnly = authorize([Role.ADMIN, Role.SUPER_ADMIN]);

router.get('/', authenticate, adminOnly, (req, res) => controller.list(req, res));
router.get('/:id', authenticate, (req, res) => controller.get(req, res));
router.post('/', authenticate, adminOnly, (req, res) => controller.create(req, res));
router.put('/:id', authenticate, (req, res) => controller.update(req, res));
router.post('/:id/change-password', authenticate, (req, res) => controller.changePassword(req, res));
router.delete('/:id', authenticate, adminOnly, (req, res) => controller.delete(req, res));
router.patch('/:id/activate', authenticate, adminOnly, (req, res) => controller.activate(req, res));
router.patch('/:id/deactivate', authenticate, adminOnly, (req, res) => controller.deactivate(req, res));

export default router;
