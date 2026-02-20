import { Router } from 'express';
import { EnrollmentController } from './controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
const Role = { STUDENT: 'STUDENT', INSTRUCTOR: 'INSTRUCTOR', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' } as const;

const router = Router();
const enrollmentController = new EnrollmentController();

// Student: Enroll in course
router.post(
  '/',
  authenticate,
  authorize([Role.STUDENT]),
  (req, res) => enrollmentController.enrollStudent(req, res)
);

// Student/Instructor/Admin: Get enrollment by ID
router.get(
  '/:id',
  authenticate,
  (req, res) => enrollmentController.getEnrollment(req, res)
);

// Student/Instructor/Admin: List enrollments
router.get(
  '/',
  authenticate,
  (req, res) => enrollmentController.listEnrollments(req, res)
);

// Student/Instructor/Admin: Update enrollment status
router.patch(
  '/:id/status',
  authenticate,
  (req, res) => enrollmentController.updateStatus(req, res)
);

// Student/Admin: Drop enrollment
router.post(
  '/:id/drop',
  authenticate,
  (req, res) => enrollmentController.dropEnrollment(req, res)
);

// Student: Get own enrollment stats
router.get(
  '/student/:studentId/stats',
  authenticate,
  (req, res) => enrollmentController.getStudentStats(req, res)
);

// Instructor/Admin: Get course enrollment stats
router.get(
  '/course/:courseId/stats',
  authenticate,
  authorize([Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN]),
  (req, res) => enrollmentController.getCourseStats(req, res)
);

export default router;
