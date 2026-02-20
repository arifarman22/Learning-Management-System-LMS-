import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { EnrollmentService } from '../services/enrollment.service';
import {
  EnrollCourseSchema,
  UpdateEnrollmentStatusSchema,
  ListEnrollmentsQuerySchema,
} from '../dto/enrollment.dto';
import { ZodError } from 'zod';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  async enrollStudent(req: Request, res: Response): Promise<void> {
    try {
      const data = EnrollCourseSchema.parse(req.body);
      const enrollment = await this.enrollmentService.enrollStudent(
        data,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in course',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const enrollment = await this.enrollmentService.getEnrollmentById(id);

      if (!enrollment) {
        res.status(404).json({
          success: false,
          error: 'Enrollment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const query = ListEnrollmentsQuerySchema.parse(req.query);
      const result = await this.enrollmentService.listEnrollments(
        query,
        req.user!.userId,
        req.user!.role as Role
      );

      res.status(200).json({
        success: true,
        data: result.enrollments,
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

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = UpdateEnrollmentStatusSchema.parse(req.body);
      const enrollment = await this.enrollmentService.updateEnrollmentStatus(
        id,
        data,
        req.user!.userId,
        req.user!.role as Role
      );

      res.status(200).json({
        success: true,
        data: enrollment,
        message: `Enrollment status updated to ${data.status}`,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async dropEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.enrollmentService.dropEnrollment(
        id,
        req.user!.userId,
        req.user!.role as Role
      );

      res.status(200).json({
        success: true,
        message: 'Enrollment dropped successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getStudentStats(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || req.user!.userId;
      const stats = await this.enrollmentService.getStudentEnrollmentStats(studentId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCourseStats(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const stats = await this.enrollmentService.getCourseEnrollmentStats(courseId);

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
    if (message.includes('Already enrolled') || message.includes('full')) return 409;
    if (message.includes('permission') || message.includes('Cannot transition')) return 403;
    if (message.includes('not available')) return 400;
    return 400;
  }
}
