import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkCourseOwnership, checkEnrollment } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public: Browse published courses
router.get('/courses', (req, res) => {
  res.json({ message: 'List all published courses' });
});

// Public/Auth: Get course details
router.get('/courses/:id', authenticate, (req, res) => {
  res.json({ message: 'Get course details' });
});

// Instructor/Admin: Create course
router.post(
  '/courses',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => {
    res.json({ message: 'Create course' });
  }
);

// Instructor/Admin: Update own course
router.put(
  '/courses/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => {
    res.json({ message: 'Update course' });
  }
);

// Instructor/Admin: Delete own course
router.delete(
  '/courses/:id',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => {
    res.json({ message: 'Delete course' });
  }
);

// Instructor/Admin: Publish own course
router.post(
  '/courses/:id/publish',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => {
    res.json({ message: 'Publish course' });
  }
);

// Enrolled/Instructor/Admin: Access course content
router.get(
  '/courses/:id/content',
  authenticate,
  checkEnrollment,
  (req, res) => {
    res.json({ message: 'Get course content' });
  }
);

// Instructor/Admin: Get enrolled students in own course
router.get(
  '/courses/:courseId/students',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkCourseOwnership,
  (req, res) => {
    res.json({ message: 'Get enrolled students' });
  }
);

export default router;
