import { Router } from 'express';
import { ProgressController } from './controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const progressController = new ProgressController();

router.post(
  '/enrollments/:enrollmentId/lessons/complete',
  authenticate,
  progressController.markLessonComplete.bind(progressController)
);

router.get(
  '/enrollments/:enrollmentId/progress',
  authenticate,
  progressController.getEnrollmentProgress.bind(progressController)
);

router.get(
  '/students/:studentId/courses/:courseId/progress',
  authenticate,
  progressController.getStudentCourseProgress.bind(progressController)
);

router.post(
  '/enrollments/:enrollmentId/progress/recalculate',
  authenticate,
  progressController.recalculateProgress.bind(progressController)
);

export default router;
