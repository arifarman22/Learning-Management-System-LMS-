import { z } from 'zod';
import { LessonType } from '@prisma/client';

export const CreateLessonSchema = z.object({
  moduleId: z.string().cuid('Invalid module ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.nativeEnum(LessonType),
  order: z.number().int().positive('Order must be positive'),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoDuration: z.number().int().positive().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    size: z.number().optional(),
  })).optional(),
  isFree: z.boolean().default(false),
  isRequired: z.boolean().default(true),
  estimatedTime: z.number().int().positive().optional(),
});

export const UpdateLessonSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(LessonType).optional(),
  content: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  videoDuration: z.number().int().positive().optional().nullable(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    size: z.number().optional(),
  })).optional().nullable(),
  isFree: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  estimatedTime: z.number().int().positive().optional().nullable(),
});

export const ReorderLessonsSchema = z.object({
  lessons: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().positive(),
  })).min(1, 'At least one lesson required'),
});

export type CreateLessonDTO = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonDTO = z.infer<typeof UpdateLessonSchema>;
export type ReorderLessonsDTO = z.infer<typeof ReorderLessonsSchema>;
