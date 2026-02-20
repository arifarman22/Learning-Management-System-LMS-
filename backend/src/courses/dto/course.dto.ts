import { z } from 'zod';
import { CourseStatus, CourseLevel } from '@prisma/client';

export const CreateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().cuid('Invalid category ID'),
  thumbnail: z.string().url().optional(),
  previewVideo: z.string().url().optional(),
  level: z.nativeEnum(CourseLevel).default(CourseLevel.ALL_LEVELS),
  language: z.string().default('en'),
  price: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  discountPrice: z.number().min(0).optional(),
  maxStudents: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  hasAssessments: z.boolean().default(false),
  hasCertificate: z.boolean().default(false),
  passingScore: z.number().int().min(0).max(100).default(70),
});

export const UpdateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.string().cuid().optional(),
  thumbnail: z.string().url().optional().nullable(),
  previewVideo: z.string().url().optional().nullable(),
  level: z.nativeEnum(CourseLevel).optional(),
  language: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  discountPrice: z.number().min(0).optional().nullable(),
  maxStudents: z.number().int().positive().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  hasAssessments: z.boolean().optional(),
  hasCertificate: z.boolean().optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
});

export const ListCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(CourseStatus).optional(),
  categoryId: z.string().cuid().optional(),
  level: z.nativeEnum(CourseLevel).optional(),
  instructorId: z.string().cuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const ChangeStatusSchema = z.object({
  status: z.nativeEnum(CourseStatus),
});

export type CreateCourseDTO = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseDTO = z.infer<typeof UpdateCourseSchema>;
export type ListCoursesQueryDTO = z.infer<typeof ListCoursesQuerySchema>;
export type ChangeStatusDTO = z.infer<typeof ChangeStatusSchema>;
