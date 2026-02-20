import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { CourseService } from '../services/course.service';
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  ListCoursesQuerySchema,
  ChangeStatusSchema,
} from '../dto/course.dto';
import { ZodError } from 'zod';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const data = CreateCourseSchema.parse(req.body);
      const course = await this.courseService.createCourse(data, req.user!.userId);

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.courseService.getCourseById(id);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCourseBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const course = await this.courseService.getCourseBySlug(slug);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listCourses(req: Request, res: Response): Promise<void> {
    try {
      const query = ListCoursesQuerySchema.parse(req.query);
      const result = await this.courseService.listCourses(
        query,
        req.user?.userId,
        req.user?.role as Role | undefined
      );

      res.status(200).json({
        success: true,
        data: result.courses,
        pagination: {
          page: result.page,
          limit: query.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = UpdateCourseSchema.parse(req.body);
      const course = await this.courseService.updateCourse(
        id,
        data,
        req.user!.userId,
        req.user!.role as Role
      );

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = ChangeStatusSchema.parse(req.body);
      const course = await this.courseService.changeStatus(
        id,
        data,
        req.user!.userId,
        req.user!.role as Role
      );

      res.status(200).json({
        success: true,
        data: course,
        message: `Course status changed to ${data.status}`,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.courseService.deleteCourse(id, req.user!.userId, req.user!.role as Role);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async restoreCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.courseService.restoreCourse(id);

      res.status(200).json({
        success: true,
        data: course,
        message: 'Course restored successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getInstructorStats(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.params.instructorId || req.user!.userId;
      const stats = await this.courseService.getInstructorStats(instructorId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      const statusCode = this.getStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }

  private getStatusCode(message: string): number {
    if (message.includes('not found')) return 404;
    if (message.includes('already exists')) return 409;
    if (message.includes('permission') || message.includes('Cannot transition')) return 403;
    return 400;
  }
}
