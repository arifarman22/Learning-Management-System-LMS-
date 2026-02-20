import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { canAccessAnalytics } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Admin: Platform-wide analytics
router.get(
  '/analytics/platform',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  canAccessAnalytics('platform'),
  (req, res) => {
    res.json({ message: 'Get platform analytics' });
  }
);

// Instructor/Admin: Course analytics
router.get(
  '/analytics/courses/:courseId',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  canAccessAnalytics('course'),
  (req, res) => {
    res.json({ message: 'Get course analytics' });
  }
);

// Student/Admin: Student analytics
router.get(
  '/analytics/students/:studentId',
  authenticate,
  canAccessAnalytics('student'),
  (req, res) => {
    res.json({ message: 'Get student analytics' });
  }
);

// Instructor: My courses analytics
router.get(
  '/analytics/my-courses',
  authenticate,
  authorize([Role.INSTRUCTOR]),
  (req, res) => {
    res.json({ message: 'Get my courses analytics' });
  }
);

// Student: My learning analytics
router.get(
  '/analytics/my-learning',
  authenticate,
  authorize([Role.STUDENT]),
  (req, res) => {
    res.json({ message: 'Get my learning analytics' });
  }
);

export default router;
