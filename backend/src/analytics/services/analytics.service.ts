import { AnalyticsRepository } from '../repositories/analytics.repository';
import { Role } from '@prisma/client';

const analyticsRepo = new AnalyticsRepository();

export class AnalyticsService {
  // Check if user can access analytics
  private canAccessAnalytics(userRole: Role): boolean {
    return userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
  }

  // Check if user can access instructor analytics
  private canAccessInstructorAnalytics(
    userId: string,
    userRole: Role,
    instructorId?: string
  ): boolean {
    const isAdmin = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
    const isSelf = instructorId === userId;
    return isAdmin || isSelf;
  }

  // Get dashboard overview
  async getDashboardOverview(userRole: Role, days: number = 10) {
    if (!this.canAccessAnalytics(userRole)) {
      throw new Error('Not authorized to access analytics');
    }

    return analyticsRepo.getDashboardOverview(days);
  }

  // Get enrollment growth
  async getEnrollmentGrowth(userRole: Role, days: number = 10) {
    if (!this.canAccessAnalytics(userRole)) {
      throw new Error('Not authorized to access analytics');
    }

    return analyticsRepo.getEnrollmentGrowth(days);
  }

  // Get top popular courses
  async getTopPopularCourses(userRole: Role, limit: number = 5) {
    if (!this.canAccessAnalytics(userRole)) {
      throw new Error('Not authorized to access analytics');
    }

    return analyticsRepo.getTopPopularCourses(limit);
  }

  // Get revenue per course
  async getRevenuePerCourse(userRole: Role) {
    if (!this.canAccessAnalytics(userRole)) {
      throw new Error('Not authorized to access analytics');
    }

    return analyticsRepo.getRevenuePerCourse();
  }

  // Get completion rate per instructor
  async getCompletionRatePerInstructor(userRole: Role) {
    if (!this.canAccessAnalytics(userRole)) {
      throw new Error('Not authorized to access analytics');
    }

    return analyticsRepo.getCompletionRatePerInstructor();
  }

  // Get single instructor completion rate
  async getInstructorCompletionRate(
    userId: string,
    userRole: Role,
    instructorId: string
  ) {
    if (!this.canAccessInstructorAnalytics(userId, userRole, instructorId)) {
      throw new Error('Not authorized to access instructor analytics');
    }

    return analyticsRepo.getInstructorCompletionRate(instructorId);
  }
}
