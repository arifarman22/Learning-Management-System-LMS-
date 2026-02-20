import { PrismaClient } from '@prisma/client';

const LessonProgressStatus = { COMPLETED: 'COMPLETED', IN_PROGRESS: 'IN_PROGRESS', NOT_STARTED: 'NOT_STARTED' } as const;

const prisma = new PrismaClient();

export class ProgressRepository {
  async markLessonComplete(
    enrollmentId: string,
    lessonId: string,
    studentId: string,
    timeSpent?: number
  ): Promise<any> {
    return prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: {
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
        ...(timeSpent !== undefined && { timeSpent }),
      },
      create: {
        enrollmentId,
        lessonId,
        studentId,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
        timeSpent: timeSpent || 0,
      },
    });
  }

  async getEnrollmentProgress(enrollmentId: string) {
    return prisma.lessonProgress.findMany({
      where: { enrollmentId },
      include: {
        lesson: {
          select: { id: true, title: true, order: true, moduleId: true },
        },
      },
      orderBy: { lesson: { order: 'asc' } },
    });
  }

  async calculateProgress(enrollmentId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  }> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        course: {
          select: {
            modules: {
              where: { deletedAt: null },
              select: { lessons: { where: { deletedAt: null }, select: { id: true } } },
            },
          },
        },
      },
    });

    if (!enrollment) throw new Error('Enrollment not found');

    const totalLessons = enrollment.course.modules.reduce(
      (sum: number, m: { lessons: { id: string }[] }) => sum + m.lessons.length,
      0
    );

    const completedLessons = await prisma.lessonProgress.count({
      where: { enrollmentId, status: LessonProgressStatus.COMPLETED },
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { totalLessons, completedLessons, percentage };
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<void> {
    const data: any = { progress, lastAccessedAt: new Date() };

    if (progress >= 100) {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    } else if (progress > 0) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { startedAt: true },
      });
      if (!enrollment?.startedAt) data.startedAt = new Date();
    }

    await prisma.enrollment.update({ where: { id: enrollmentId }, data });
  }

  async getStudentCourseProgress(studentId: string, courseId: string) {
    return prisma.enrollment.findFirst({
      where: { studentId, courseId, deletedAt: null },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true,
                moduleId: true,
                module: { select: { id: true, title: true, order: true } },
              },
            },
          },
          orderBy: { lesson: { order: 'asc' } },
        },
        course: { select: { id: true, title: true, slug: true } },
      },
    });
  }
}
