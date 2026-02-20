import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LessonRepository {
  async findById(id: string, includeDeleted = false): Promise<any> {
    return prisma.lesson.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });
  }

  async findByModule(moduleId: string, includeDeleted = false): Promise<any[]> {
    return prisma.lesson.findMany({
      where: {
        moduleId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: any): Promise<any> {
    return prisma.lesson.create({
      data,
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.lesson.update({
      where: { id },
      data,
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });
  }

  async softDelete(id: string): Promise<any> {
    return prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<any> {
    return prisma.lesson.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async getNextOrder(moduleId: string): Promise<number> {
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastLesson ? lastLesson.order + 1 : 1;
  }

  async reorderLessons(updates: { id: string; order: number }[]): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.lesson.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async checkOrderConflict(moduleId: string, order: number, excludeId?: string): Promise<boolean> {
    const existing = await prisma.lesson.findFirst({
      where: {
        moduleId,
        order,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !!existing;
  }

  async countByModule(moduleId: string): Promise<number> {
    return prisma.lesson.count({
      where: { moduleId, deletedAt: null },
    });
  }
}
