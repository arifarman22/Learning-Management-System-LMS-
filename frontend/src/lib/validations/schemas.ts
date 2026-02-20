import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
});

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  categoryId: z.string().uuid().optional(),
  thumbnail: z.string().url().optional(),
  maxStudents: z.number().int().positive().optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'READING', 'QUIZ', 'ASSIGNMENT', 'LIVE_SESSION']),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  order: z.number().int().positive(),
  isFree: z.boolean().default(false),
  moduleId: z.string().uuid(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
