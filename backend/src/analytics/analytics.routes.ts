import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';
import { authenticate } from '../auth/middleware/auth.middleware';
import { Role } from '@prisma/client';
import { authorize } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

const adminOnly = authorize([Role.ADMIN, Role.SUPER_ADMIN]);

router.get('/dashboard', authenticate, adminOnly, analyticsController.getDashboardOverview.bind(analyticsController));
router.get('/enrollments/growth', authenticate, adminOnly, analyticsController.getEnrollmentGrowth.bind(analyticsController));
router.get('/courses/popular', authenticate, adminOnly, analyticsController.getTopPopularCourses.bind(analyticsController));
router.get('/revenue/courses', authenticate, adminOnly, analyticsController.getRevenuePerCourse.bind(analyticsController));
router.get('/instructors/completion-rate', authenticate, adminOnly, analyticsController.getCompletionRatePerInstructor.bind(analyticsController));
router.get('/instructors/:instructorId/completion-rate', authenticate, analyticsController.getInstructorCompletionRate.bind(analyticsController));

export default router;
