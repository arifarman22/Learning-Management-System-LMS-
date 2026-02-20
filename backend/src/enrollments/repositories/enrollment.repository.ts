import { PrismaClient, Enrollment, EnrollmentStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  courseId?: string;
  studentId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class EnrollmentRepository {
  async findById(id: string, includeDeleted = false): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructorId: true,
          },
        },
      },
    });
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
    includeDeleted = false
  ): Promise<Enrollment | null> {
    return prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        course: true,
      },
    });
  }

  async findMany(
    filters: EnrollmentFilters,
    pagination: PaginationOptions
  ): Promise<{ enrollments: Enrollment[]; total: number }> {
    const where: Prisma.EnrollmentWhereInput = {
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.courseId && { courseId: filters.courseId }),
      ...(filters.studentId && { studentId: filters.studentId }),
    };

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    return { enrollments, total };
  }

  async createWithTransaction(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    return prisma.$transaction(async (tx) => {
      // Check for existing enrollment (prevents race condition)
      const existing = await tx.enrollment.findFirst({
        where: {
          studentId,
          courseId,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new Error('Already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseId,
          enrolledAt: new Date(),
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      });

      return enrollment;
    });
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<Enrollment> {
    const data: Prisma.EnrollmentUpdateInput = { status };

    if (status === EnrollmentStatus.COMPLETED) {
      data.completedAt = new Date();
      data.progress = 100;
    }

    return prisma.enrollment.update({
      where: { id },
      data,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    });
  }

  async updateProgress(id: string, progress: number): Promise<Enrollment> {
    return prisma.enrollment.update({
      where: { id },
      data: {
        progress,
        lastAccessedAt: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Enrollment> {
    return prisma.enrollment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countByStudent(studentId: string, status?: EnrollmentStatus): Promise<number> {
    return prisma.enrollment.count({
      where: {
        studentId,
        deletedAt: null,
        ...(status && { status }),
      },
    });
  }

  async countByCourse(courseId: string, status?: EnrollmentStatus): Promise<number> {
    return prisma.enrollment.count({
      where: {
        courseId,
        deletedAt: null,
        ...(status && { status }),
      },
    });
  }
}
