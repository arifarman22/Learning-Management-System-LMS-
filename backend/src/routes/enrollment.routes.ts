import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkCourseOwnership, checkInstructorStudentAccess } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Student: Enroll in course
router.post(
  '/courses/:id/enroll',
  authenticate,
  authorize([Role.STUDENT]),
  (req, res) => {
    res.json({ message: 'Enroll in course' });
  }
);

// Student: Get my enrollments
router.get(
  '/enrollments/my',
  authenticate,
  authorize([Role.STUDENT]),
  (req, res) => {
    res.json({ message: 'Get my enrollments' });
  }
);

// Student: Drop enrollment
router.delete(
  '/enrollments/:id',
  authenticate,
  authorize([Role.STUDENT]),
  (req, res) => {
    // Check ownership in controller
    res.json({ message: 'Drop enrollment' });
  }
);

// Admin: Manually enroll student
router.post(
  '/enrollments',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => {
    res.json({ message: 'Manually enroll student' });
  }
);

// Instructor/Admin: Get student progress in course
router.get(
  '/courses/:courseId/students/:studentId/progress',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  checkInstructorStudentAccess,
  (req, res) => {
    res.json({ message: 'Get student progress' });
  }
);

export default router;
