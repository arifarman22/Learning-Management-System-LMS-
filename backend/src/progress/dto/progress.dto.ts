import { z } from 'zod';

export const MarkLessonCompleteSchema = z.object({
  lessonId: z.string().cuid(),
  timeSpent: z.number().int().min(0).optional(),
});

export type MarkLessonCompleteDto = z.infer<typeof MarkLessonCompleteSchema>;
