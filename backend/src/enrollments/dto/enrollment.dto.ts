import { z } from 'zod';

const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  DROPPED: 'DROPPED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const EnrollCourseSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const UpdateEnrollmentStatusSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus),
});

export const ListEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(EnrollmentStatus).optional(),
  courseId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  sortBy: z.enum(['enrolledAt', 'completedAt', 'progress']).default('enrolledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type EnrollCourseDTO = z.infer<typeof EnrollCourseSchema>;
export type UpdateEnrollmentStatusDTO = z.infer<typeof UpdateEnrollmentStatusSchema>;
export type ListEnrollmentsQueryDTO = z.infer<typeof ListEnrollmentsQuerySchema>;
