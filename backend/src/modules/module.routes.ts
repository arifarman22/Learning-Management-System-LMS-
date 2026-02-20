import { Router } from 'express';
import { ModuleController } from './controllers/module.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
const Role = { STUDENT: 'STUDENT', INSTRUCTOR: 'INSTRUCTOR', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' } as const;

const router = Router();
const moduleController = new ModuleController();

// Public/Auth: Get modules by course
router.get(
  '/course/:courseId',
  optionalAuth,
  (req, res) => moduleController.getModulesByCourse(req, res)
);

// Public/Auth: Get module by ID
router.get(
  '/:id',
  optionalAuth,
  (req, res) => moduleController.getModule(req, res)
);

// Instructor/Admin: Create module
router.post(
  '/',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => moduleController.createModule(req, res)
);

// Instructor/Admin: Update module
router.put(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => moduleController.updateModule(req, res)
);

// Instructor/Admin: Delete module
router.delete(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => moduleController.deleteModule(req, res)
);

export default router;