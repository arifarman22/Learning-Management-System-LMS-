import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(10),
});

export const InstructorAnalyticsQuerySchema = z.object({
  instructorId: z.string().uuid().optional(),
});

export type DashboardQueryDto = z.infer<typeof DashboardQuerySchema>;
export type InstructorAnalyticsQueryDto = z.infer<typeof InstructorAnalyticsQuerySchema>;
