import { ProgressRepository } from '../repositories/progress.repository';
import { PrismaClient, Role } from '@prisma/client';
import { MarkLessonCompleteDto } from '../dto/progress.dto';

const prisma = new PrismaClient();
const progressRepo = new ProgressRepository();

export class ProgressService {
  // Mark lesson complete and recalculate progress
  async markLessonComplete(
    userId: string,
    userRole: Role,
    enrollmentId: string,
    dto: MarkLessonCompleteDto
  ) {
    // Verify enrollment ownership
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        studentId: true,
        status: true,
        course: {
          select: {
            id: true,
            modules: {
              where: { deletedAt: null },
              select: {
                lessons: {
                  where: {
                    id: dto.lessonId,
                    deletedAt: null,
                  },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Permission check
    const isAdmin = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
    if (!isAdmin && enrollment.studentId !== userId) {
      throw new Error('Not authorized to update this enrollment');
    }

    // Verify lesson belongs to course
    const lessonExists = enrollment.course.modules.some((module) =>
      module.lessons.some((lesson) => lesson.id === dto.lessonId)
    );

    if (!lessonExists) {
      throw new Error('Lesson not found in this course');
    }

    // Check enrollment is active
    if (enrollment.status !== 'ACTIVE' && enrollment.status !== 'COMPLETED') {
      throw new Error('Cannot update progress for inactive enrollment');
    }

    // Mark lesson complete (idempotent)
    await progressRepo.markLessonComplete(
      enrollmentId,
      dto.lessonId,
      enrollment.studentId,
      dto.timeSpent
    );

    // Recalculate progress
    const { percentage } = await progressRepo.calculateProgress(enrollmentId);

    // Update enrollment progress (auto-complete at 100%)
    await progressRepo.updateEnrollmentProgress(enrollmentId, percentage);

    return { success: true, progress: percentage };
  }

  // Get enrollment progress
  async getEnrollmentProgress(
    userId: string,
    userRole: Role,
    enrollmentId: string
  ) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        studentId: true,
        progress: true,
        status: true,
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Permission check
    const isAdmin = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
    const isStudent = enrollment.studentId === userId;
    const isInstructor = enrollment.course.instructorId === userId;

    if (!isAdmin && !isStudent && !isInstructor) {
      throw new Error('Not authorized to view this progress');
    }

    const progressData = await progressRepo.getEnrollmentProgress(enrollmentId);
    const { totalLessons, completedLessons, percentage } =
      await progressRepo.calculateProgress(enrollmentId);

    return {
      enrollmentId,
      progress: percentage,
      totalLessons,
      completedLessons,
      lessons: progressData,
    };
  }

  // Get student's course progress
  async getStudentCourseProgress(
    userId: string,
    userRole: Role,
    studentId: string,
    courseId: string
  ) {
    // Permission check
    const isAdmin = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
    const isSelf = userId === studentId;

    // Check if instructor owns course
    let isInstructor = false;
    if (!isAdmin && !isSelf) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      });
      isInstructor = course?.instructorId === userId;
    }

    if (!isAdmin && !isSelf && !isInstructor) {
      throw new Error('Not authorized to view this progress');
    }

    const data = await progressRepo.getStudentCourseProgress(studentId, courseId);

    if (!data) {
      throw new Error('Enrollment not found');
    }

    const { totalLessons, completedLessons, percentage } =
      await progressRepo.calculateProgress(data.id);

    return {
      enrollment: {
        id: data.id,
        status: data.status,
        progress: percentage,
        enrolledAt: data.enrolledAt,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },
      course: data.course,
      totalLessons,
      completedLessons,
      lessonProgress: data.lessonProgress,
    };
  }

  // Recalculate progress (admin/instructor utility)
  async recalculateProgress(
    userId: string,
    userRole: Role,
    enrollmentId: string
  ) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        course: {
          select: { instructorId: true },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Only admin or instructor can recalculate
    const isAdmin = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
    const isInstructor = enrollment.course.instructorId === userId;

    if (!isAdmin && !isInstructor) {
      throw new Error('Not authorized to recalculate progress');
    }

    const { totalLessons, completedLessons, percentage } =
      await progressRepo.calculateProgress(enrollmentId);

    await progressRepo.updateEnrollmentProgress(enrollmentId, percentage);

    return {
      enrollmentId,
      totalLessons,
      completedLessons,
      progress: percentage,
    };
  }
}
