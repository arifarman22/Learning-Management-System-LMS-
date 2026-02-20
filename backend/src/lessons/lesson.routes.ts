import { Router } from 'express';
import { LessonController } from './controllers/lesson.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
const Role = { STUDENT: 'STUDENT', INSTRUCTOR: 'INSTRUCTOR', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' } as const;

const router = Router();
const lessonController = new LessonController();

// Instructor/Admin: Create lesson
router.post(
  '/',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => lessonController.createLesson(req, res)
);

// Public/Auth: Get lesson by ID
router.get(
  '/:id',
  (req, res) => lessonController.getLesson(req, res)
);

// Public/Auth: Get lessons by module
router.get(
  '/module/:moduleId',
  (req, res) => lessonController.getLessonsByModule(req, res)
);

// Instructor/Admin: Update lesson
router.put(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => lessonController.updateLesson(req, res)
);

// Instructor/Admin: Delete lesson
router.delete(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => lessonController.deleteLesson(req, res)
);

// Instructor/Admin: Reorder lessons in module
router.post(
  '/module/:moduleId/reorder',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => lessonController.reorderLessons(req, res)
);

// Instructor/Admin: Get next order number for module
router.get(
  '/module/:moduleId/next-order',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => lessonController.getNextOrder(req, res)
);

export default router;
