import { Course, CourseStatus, Role } from '@prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import {
  CreateCourseDTO,
  UpdateCourseDTO,
  ListCoursesQueryDTO,
  ChangeStatusDTO,
} from '../dto/course.dto';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async createCourse(
    data: CreateCourseDTO,
    instructorId: string
  ): Promise<Course> {
    // Check slug uniqueness
    const existingCourse = await this.courseRepository.findBySlug(data.slug);
    if (existingCourse) {
      throw new Error('Course slug already exists');
    }

    // Validate discount price
    if (data.discountPrice && data.discountPrice >= data.price) {
      throw new Error('Discount price must be less than regular price');
    }

    const course = await this.courseRepository.create({
      title: data.title,
      slug: data.slug,
      description: data.description,
      thumbnail: data.thumbnail,
      previewVideo: data.previewVideo,
      level: data.level,
      language: data.language,
      price: data.price,
      currency: data.currency,
      discountPrice: data.discountPrice,
      maxStudents: data.maxStudents,
      duration: data.duration,
      hasAssessments: data.hasAssessments,
      hasCertificate: data.hasCertificate,
      passingScore: data.passingScore,
      instructor: { connect: { id: instructorId } },
      category: { connect: { id: data.categoryId } },
    });

    return course;
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.courseRepository.findById(id);
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    return this.courseRepository.findBySlug(slug);
  }

  async listCourses(
    query: ListCoursesQueryDTO,
    requestorId?: string,
    requestorRole?: Role
  ): Promise<{ courses: Course[]; total: number; page: number; totalPages: number }> {
    // Non-admins can only see published courses (unless viewing own)
    let filters = {
      status: query.status,
      categoryId: query.categoryId,
      level: query.level,
      instructorId: query.instructorId,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      includeDeleted: false,
    };

    // If not admin and not viewing own courses, only show published
    if (
      requestorRole &&
      requestorRole !== Role.ADMIN && requestorRole !== Role.SUPER_ADMIN &&
      query.instructorId !== requestorId
    ) {
      filters.status = CourseStatus.PUBLISHED;
    }

    const { courses, total } = await this.courseRepository.findMany(filters, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      courses,
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async updateCourse(
    id: string,
    data: UpdateCourseDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Course> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const isOwner = course.instructorId === requestorId;
    const isAdmin = requestorRole === Role.ADMIN || requestorRole === Role.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to update this course');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== course.slug) {
      const existingCourse = await this.courseRepository.findBySlug(data.slug);
      if (existingCourse) {
        throw new Error('Course slug already exists');
      }
    }

    // Validate discount price
    if (data.discountPrice !== undefined && data.discountPrice !== null && data.price !== undefined) {
      if (data.discountPrice >= data.price) {
        throw new Error('Discount price must be less than regular price');
      }
    }

    const updatedCourse = await this.courseRepository.update(id, data);
    return updatedCourse;
  }

  async changeStatus(
    id: string,
    data: ChangeStatusDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Course> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const isOwner = course.instructorId === requestorId;
    const isAdmin = requestorRole === Role.ADMIN || requestorRole === Role.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to change course status');
    }

    // Validate status transitions
    this.validateStatusTransition(course.status, data.status);

    // Validate course is ready for publishing
    if (data.status === CourseStatus.PUBLISHED) {
      await this.validatePublishRequirements(id);
    }

    const updatedCourse = await this.courseRepository.changeStatus(id, data.status);
    return updatedCourse;
  }

  async deleteCourse(
    id: string,
    requestorId: string,
    requestorRole: Role
  ): Promise<void> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new Error('Course not found');
    }

    // Check ownership
    const isOwner = course.instructorId === requestorId;
    const isAdmin = requestorRole === Role.ADMIN || requestorRole === Role.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to delete this course');
    }

    await this.courseRepository.softDelete(id);
  }

  async restoreCourse(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id, true);

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.deletedAt) {
      throw new Error('Course is not deleted');
    }

    return this.courseRepository.restore(id);
  }

  async getInstructorStats(instructorId: string): Promise<{
    total: number;
    draft: number;
    published: number;
    archived: number;
  }> {
    const [total, draft, published, archived] = await Promise.all([
      this.courseRepository.countByInstructor(instructorId),
      this.courseRepository.countByStatus(instructorId, CourseStatus.DRAFT),
      this.courseRepository.countByStatus(instructorId, CourseStatus.PUBLISHED),
      this.courseRepository.countByStatus(instructorId, CourseStatus.ARCHIVED),
    ]);

    return { total, draft, published, archived };
  }

  private validateStatusTransition(from: CourseStatus, to: CourseStatus): void {
    const validTransitions: Record<CourseStatus, CourseStatus[]> = {
      [CourseStatus.DRAFT]: [CourseStatus.PUBLISHED],
      [CourseStatus.PUBLISHED]: [CourseStatus.DRAFT, CourseStatus.ARCHIVED],
      [CourseStatus.ARCHIVED]: [CourseStatus.PUBLISHED],
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`Cannot transition from ${from} to ${to}`);
    }
  }

  private async validatePublishRequirements(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.title || course.title.length < 3) {
      throw new Error('Course must have a valid title');
    }

    if (!course.description || course.description.length < 10) {
      throw new Error('Course must have a valid description');
    }

    if (!course.categoryId) {
      throw new Error('Course must have a category');
    }

    // Additional validation can be added here
    // e.g., must have at least one module, etc.
  }
}
