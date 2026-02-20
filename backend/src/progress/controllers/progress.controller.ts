import { Request, Response } from 'express';
import { ProgressService } from '../services/progress.service';
import { MarkLessonCompleteSchema } from '../dto/progress.dto';

const progressService = new ProgressService();

export class ProgressController {
  async markLessonComplete(req: Request, res: Response) {
    try {
      const { enrollmentId } = req.params;
      const dto = MarkLessonCompleteSchema.parse(req.body);

      const result = await progressService.markLessonComplete(
        req.user!.userId,
        req.user!.role,
        enrollmentId,
        dto
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEnrollmentProgress(req: Request, res: Response) {
    try {
      const { enrollmentId } = req.params;

      const progress = await progressService.getEnrollmentProgress(
        req.user!.userId,
        req.user!.role,
        enrollmentId
      );

      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStudentCourseProgress(req: Request, res: Response) {
    try {
      const { studentId, courseId } = req.params;

      const progress = await progressService.getStudentCourseProgress(
        req.user!.userId,
        req.user!.role,
        studentId,
        courseId
      );

      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async recalculateProgress(req: Request, res: Response) {
    try {
      const { enrollmentId } = req.params;

      const result = await progressService.recalculateProgress(
        req.user!.userId,
        req.user!.role,
        enrollmentId
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
