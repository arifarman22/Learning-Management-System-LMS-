import { Router } from 'express';
import { CourseController } from './controllers/course.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { checkCourseOwnership } from '../middleware/rbac.middleware';
const Role = { STUDENT: 'STUDENT', INSTRUCTOR: 'INSTRUCTOR', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' } as const;

const router = Router();
const courseController = new CourseController();

// Public: List published courses
router.get(
  '/',
  optionalAuth,
  (req, res) => courseController.listCourses(req, res)
);

// Public: Get course by slug
router.get(
  '/slug/:slug',
  optionalAuth,
  (req, res) => courseController.getCourseBySlug(req, res)
);

// Public: Get course by ID
router.get(
  '/:id',
  optionalAuth,
  (req, res) => courseController.getCourse(req, res)
);

// Instructor/Admin: Create course
router.post(
  '/',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => courseController.createCourse(req, res)
);

// Instructor/Admin: Update own course
router.put(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => courseController.updateCourse(req, res)
);

// Instructor/Admin: Change course status
router.patch(
  '/:id/status',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => courseController.changeStatus(req, res)
);

// Instructor/Admin: Delete own course
router.delete(
  '/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => courseController.deleteCourse(req, res)
);

// Admin: Restore deleted course
router.post(
  '/:id/restore',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => courseController.restoreCourse(req, res)
);

// Instructor: Get own course stats
router.get(
  '/instructor/:instructorId/stats',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => courseController.getInstructorStats(req, res)
);

export default router;
