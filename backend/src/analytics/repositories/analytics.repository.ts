import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsRepository {
  // Total users count (excluding deleted)
  async getTotalUsers(): Promise<number> {
    return prisma.user.count({
      where: { deletedAt: null },
    });
  }

  // Total courses count (excluding deleted)
  async getTotalCourses(): Promise<number> {
    return prisma.course.count({
      where: { deletedAt: null },
    });
  }

  // Enrollment growth for last N days (DB-level aggregation)
  async getEnrollmentGrowth(days: number): Promise<
    Array<{
      date: string;
      count: number;
    }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Raw SQL for efficient date grouping
    const result = await prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT 
        DATE(enrolledAt) as date,
        COUNT(*)::bigint as count
      FROM "Enrollment"
      WHERE "enrolledAt" >= ${startDate}
        AND "deletedAt" IS NULL
      GROUP BY DATE(enrolledAt)
      ORDER BY date ASC
    `;

    return result.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count),
    }));
  }

  // Top 5 popular courses by enrollment count (DB-level aggregation)
  async getTopPopularCourses(limit: number = 5): Promise<
    Array<{
      courseId: string;
      courseTitle: string;
      courseSlug: string;
      enrollmentCount: number;
      instructorName: string;
    }>
  > {
    const result = await prisma.course.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return result.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      enrollmentCount: course._count.enrollments,
      instructorName: `${course.instructor.firstName} ${course.instructor.lastName}`,
    }));
  }

  // Revenue per course (DB-level aggregation with SUM)
  async getRevenuePerCourse(): Promise<
    Array<{
      courseId: string;
      courseTitle: string;
      totalRevenue: number;
      totalPayments: number;
      averagePrice: number;
    }>
  > {
    const result = await prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    return result
      .map((course) => {
        const totalRevenue = course.payments.reduce(
          (sum, payment) => sum + payment.amount.toNumber(),
          0
        );
        const totalPayments = course.payments.length;
        const averagePrice = totalPayments > 0 ? totalRevenue / totalPayments : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          totalRevenue,
          totalPayments,
          averagePrice: Math.round(averagePrice * 100) / 100,
        };
      })
      .filter((course) => course.totalPayments > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  // Completion rate per instructor (DB-level aggregation)
  async getCompletionRatePerInstructor(): Promise<
    Array<{
      instructorId: string;
      instructorName: string;
      totalEnrollments: number;
      completedEnrollments: number;
      completionRate: number;
      totalCourses: number;
    }>
  > {
    const instructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        coursesCreated: {
          where: { deletedAt: null },
          select: {
            id: true,
            enrollments: {
              where: { deletedAt: null },
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return instructors
      .map((instructor) => {
        const totalCourses = instructor.coursesCreated.length;
        const allEnrollments = instructor.coursesCreated.flatMap(
          (course) => course.enrollments
        );
        const totalEnrollments = allEnrollments.length;
        const completedEnrollments = allEnrollments.filter(
          (e) => e.status === 'COMPLETED'
        ).length;
        const completionRate =
          totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100 * 100) / 100
            : 0;

        return {
          instructorId: instructor.id,
          instructorName: `${instructor.firstName} ${instructor.lastName}`,
          totalEnrollments,
          completedEnrollments,
          completionRate,
          totalCourses,
        };
      })
      .filter((i) => i.totalEnrollments > 0)
      .sort((a, b) => b.completionRate - a.completionRate);
  }

  // Single instructor completion rate
  async getInstructorCompletionRate(instructorId: string): Promise<{
    instructorId: string;
    instructorName: string;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    totalCourses: number;
    courseBreakdown: Array<{
      courseId: string;
      courseTitle: string;
      enrollments: number;
      completed: number;
      completionRate: number;
    }>;
  }> {
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        coursesCreated: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            enrollments: {
              where: { deletedAt: null },
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    const courseBreakdown = instructor.coursesCreated.map((course) => {
      const enrollments = course.enrollments.length;
      const completed = course.enrollments.filter((e) => e.status === 'COMPLETED').length;
      const completionRate =
        enrollments > 0 ? Math.round((completed / enrollments) * 100 * 100) / 100 : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        enrollments,
        completed,
        completionRate,
      };
    });

    const totalEnrollments = courseBreakdown.reduce((sum, c) => sum + c.enrollments, 0);
    const completedEnrollments = courseBreakdown.reduce((sum, c) => sum + c.completed, 0);
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100 * 100) / 100
        : 0;

    return {
      instructorId: instructor.id,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      totalCourses: instructor.coursesCreated.length,
      courseBreakdown,
    };
  }

  // Dashboard overview (combines multiple metrics)
  async getDashboardOverview(days: number = 10) {
    const [
      totalUsers,
      totalCourses,
      enrollmentGrowth,
      topCourses,
      revenuePerCourse,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalCourses(),
      this.getEnrollmentGrowth(days),
      this.getTopPopularCourses(5),
      this.getRevenuePerCourse(),
    ]);

    // Calculate total revenue (DB aggregation already done)
    const totalRevenue = revenuePerCourse.reduce((sum, c) => sum + c.totalRevenue, 0);

    // Calculate total enrollments
    const totalEnrollments = await prisma.enrollment.count({
      where: { deletedAt: null },
    });

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      enrollmentGrowth,
      topCourses,
      revenuePerCourse: revenuePerCourse.slice(0, 10),
    };
  }
}
