import { Lesson, Role } from '@prisma/client';
import { LessonRepository } from '../repositories/lesson.repository';
import { CreateLessonDTO, UpdateLessonDTO, ReorderLessonsDTO } from '../dto/lesson.dto';

export class LessonService {
  private lessonRepository: LessonRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
  }

  async createLesson(
    data: CreateLessonDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Lesson> {
    // Verify ownership through module -> course
    const lessons = await this.lessonRepository.findByModule(data.moduleId);
    if (lessons.length > 0) {
      const firstLesson = await this.lessonRepository.findById(lessons[0].id);
      if (firstLesson) {
        await this.verifyOwnership(
          firstLesson.module.course.instructorId,
          requestorId,
          requestorRole
        );
      }
    }

    // Check order conflict
    const hasConflict = await this.lessonRepository.checkOrderConflict(
      data.moduleId,
      data.order
    );

    if (hasConflict) {
      throw new Error('Lesson order already exists in this module');
    }

    const lesson = await this.lessonRepository.create({
      title: data.title,
      description: data.description,
      type: data.type,
      order: data.order,
      content: data.content,
      videoUrl: data.videoUrl,
      videoDuration: data.videoDuration,
      attachments: data.attachments as any,
      isFree: data.isFree,
      isRequired: data.isRequired,
      estimatedTime: data.estimatedTime,
      module: { connect: { id: data.moduleId } },
    });

    return lesson;
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return this.lessonRepository.findById(id);
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    return this.lessonRepository.findByModule(moduleId);
  }

  async updateLesson(
    id: string,
    data: UpdateLessonDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(id);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Verify ownership
    await this.verifyOwnership(
      lesson.module.course.instructorId,
      requestorId,
      requestorRole
    );

    const updatedLesson = await this.lessonRepository.update(id, data);
    return updatedLesson;
  }

  async deleteLesson(
    id: string,
    requestorId: string,
    requestorRole: Role
  ): Promise<void> {
    const lesson = await this.lessonRepository.findById(id);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Verify ownership
    await this.verifyOwnership(
      lesson.module.course.instructorId,
      requestorId,
      requestorRole
    );

    await this.lessonRepository.softDelete(id);
  }

  async reorderLessons(
    moduleId: string,
    data: ReorderLessonsDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Lesson[]> {
    // Verify all lessons belong to the module
    const moduleLessons = await this.lessonRepository.findByModule(moduleId);
    const lessonIds = moduleLessons.map((l) => l.id);

    for (const item of data.lessons) {
      if (!lessonIds.includes(item.id)) {
        throw new Error(`Lesson ${item.id} does not belong to this module`);
      }
    }

    // Verify ownership
    if (moduleLessons.length > 0) {
      const firstLesson = await this.lessonRepository.findById(moduleLessons[0].id);
      if (firstLesson) {
        await this.verifyOwnership(
          firstLesson.module.course.instructorId,
          requestorId,
          requestorRole
        );
      }
    }

    // Validate order uniqueness
    const orders = data.lessons.map((l) => l.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Duplicate order values are not allowed');
    }

    // Perform reordering in transaction
    await this.lessonRepository.reorderLessons(data.lessons);

    // Return updated lessons
    return this.lessonRepository.findByModule(moduleId);
  }

  async getNextOrder(moduleId: string): Promise<number> {
    return this.lessonRepository.getNextOrder(moduleId);
  }

  private async verifyOwnership(
    instructorId: string,
    requestorId: string,
    requestorRole: Role
  ): Promise<void> {
    const isOwner = instructorId === requestorId;
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(requestorRole);

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to modify this lesson');
    }
  }
}
