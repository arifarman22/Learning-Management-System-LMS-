import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardQuerySchema, InstructorAnalyticsQuerySchema } from '../dto/analytics.dto';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const { days } = DashboardQuerySchema.parse(req.query);

      const data = await analyticsService.getDashboardOverview(req.user!.role as Role, days);

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEnrollmentGrowth(req: Request, res: Response) {
    try {
      const { days } = DashboardQuerySchema.parse(req.query);

      const data = await analyticsService.getEnrollmentGrowth(req.user!.role as Role, days);

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTopPopularCourses(req: Request, res: Response) {
    try {
      const data = await analyticsService.getTopPopularCourses(req.user!.role as Role, 5);

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRevenuePerCourse(req: Request, res: Response) {
    try {
      const data = await analyticsService.getRevenuePerCourse(req.user!.role as Role);

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompletionRatePerInstructor(req: Request, res: Response) {
    try {
      const data = await analyticsService.getCompletionRatePerInstructor(req.user!.role as Role);

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getInstructorCompletionRate(req: Request, res: Response) {
    try {
      const { instructorId } = req.params;

      const data = await analyticsService.getInstructorCompletionRate(
        req.user!.userId,
        req.user!.role as Role,
        instructorId
      );

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
