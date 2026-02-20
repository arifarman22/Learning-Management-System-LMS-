import { PrismaClient, Course, CourseStatus, CourseLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CourseFilters {
  status?: CourseStatus;
  categoryId?: string;
  level?: CourseLevel;
  instructorId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeDeleted?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class CourseRepository {
  async findById(id: string, includeDeleted = false): Promise<Course | null> {
    return prisma.course.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Course | null> {
    return prisma.course.findUnique({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  async findMany(
    filters: CourseFilters,
    pagination: PaginationOptions
  ): Promise<{ courses: Course[]; total: number }> {
    const where: Prisma.CourseWhereInput = {
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
      ...(filters.status && { status: filters.status }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.level && { level: filters.level }),
      ...(filters.instructorId && { instructorId: filters.instructorId }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.minPrice !== undefined && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice !== undefined && { price: { lte: filters.maxPrice } }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    return prisma.course.create({
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  async softDelete(id: string): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async changeStatus(id: string, status: CourseStatus): Promise<Course> {
    const data: Prisma.CourseUpdateInput = { status };

    if (status === CourseStatus.PUBLISHED) {
      data.publishedAt = new Date();
    } else if (status === CourseStatus.ARCHIVED) {
      data.archivedAt = new Date();
    }

    return prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  async countByInstructor(instructorId: string): Promise<number> {
    return prisma.course.count({
      where: { instructorId, deletedAt: null },
    });
  }

  async countByStatus(instructorId: string, status: CourseStatus): Promise<number> {
    return prisma.course.count({
      where: { instructorId, status, deletedAt: null },
    });
  }
}
