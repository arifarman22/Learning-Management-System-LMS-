import { Request, Response } from 'express';
import { LessonService } from '../services/lesson.service';
import {
  CreateLessonSchema,
  UpdateLessonSchema,
  ReorderLessonsSchema,
} from '../dto/lesson.dto';
import { ZodError } from 'zod';

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

  async createLesson(req: Request, res: Response): Promise<void> {
    try {
      const data = CreateLessonSchema.parse(req.body);
      const lesson = await this.lessonService.createLesson(
        data,
        req.user!.userId,
        req.user!.role
      );

      res.status(201).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getLesson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const lesson = await this.lessonService.getLessonById(id);

      if (!lesson) {
        res.status(404).json({
          success: false,
          error: 'Lesson not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getLessonsByModule(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const lessons = await this.lessonService.getLessonsByModule(moduleId);

      res.status(200).json({
        success: true,
        data: lessons,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateLesson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = UpdateLessonSchema.parse(req.body);
      const lesson = await this.lessonService.updateLesson(
        id,
        data,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteLesson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.lessonService.deleteLesson(id, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async reorderLessons(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const data = ReorderLessonsSchema.parse(req.body);
      const lessons = await this.lessonService.reorderLessons(
        moduleId,
        data,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: lessons,
        message: 'Lessons reordered successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getNextOrder(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const nextOrder = await this.lessonService.getNextOrder(moduleId);

      res.status(200).json({
        success: true,
        data: { nextOrder },
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
    if (message.includes('permission') || message.includes('Duplicate order')) return 403;
    return 400;
  }
}
