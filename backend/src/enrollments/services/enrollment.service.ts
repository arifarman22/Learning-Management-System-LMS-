import { Enrollment, EnrollmentStatus, Role, CourseStatus } from '@prisma/client';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { PrismaClient } from '@prisma/client';
import {
  EnrollCourseDTO,
  UpdateEnrollmentStatusDTO,
  ListEnrollmentsQueryDTO,
} from '../dto/enrollment.dto';

const prisma = new PrismaClient();

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  async enrollStudent(
    data: EnrollCourseDTO,
    studentId: string
  ): Promise<Enrollment> {
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: data.courseId, deletedAt: null },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new Error('Course is not available for enrollment');
    }

    // Check max students limit
    if (course.maxStudents) {
      const enrollmentCount = await this.enrollmentRepository.countByCourse(
        data.courseId,
        EnrollmentStatus.ACTIVE
      );

      if (enrollmentCount >= course.maxStudents) {
        throw new Error('Course is full');
      }
    }

    // Create enrollment with transaction (prevents duplicates)
    const enrollment = await this.enrollmentRepository.createWithTransaction(
      studentId,
      data.courseId
    );

    return enrollment;
  }

  async getEnrollmentById(id: string): Promise<Enrollment | null> {
    return this.enrollmentRepository.findById(id);
  }

  async listEnrollments(
    query: ListEnrollmentsQueryDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<{ enrollments: Enrollment[]; total: number; page: number; totalPages: number }> {
    let filters = {
      status: query.status,
      courseId: query.courseId,
      studentId: query.studentId,
    };

    // Students can only see their own enrollments
    if (requestorRole === Role.STUDENT) {
      filters.studentId = requestorId;
    }

    const { enrollments, total } = await this.enrollmentRepository.findMany(filters, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      enrollments,
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async updateEnrollmentStatus(
    id: string,
    data: UpdateEnrollmentStatusDTO,
    requestorId: string,
    requestorRole: Role
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Verify permissions
    const isStudent = enrollment.studentId === requestorId;
    const isInstructor =
      requestorRole === Role.INSTRUCTOR && (enrollment as any).course.instructorId === requestorId;
    const isAdmin = requestorRole === Role.ADMIN || requestorRole === Role.SUPER_ADMIN;

    if (!isStudent && !isInstructor && !isAdmin) {
      throw new Error('You do not have permission to update this enrollment');
    }

    // Validate status transitions
    this.validateStatusTransition(enrollment.status, data.status, requestorRole);

    const updatedEnrollment = await this.enrollmentRepository.updateStatus(id, data.status);
    return updatedEnrollment;
  }

  async dropEnrollment(
    id: string,
    requestorId: string,
    requestorRole: Role
  ): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Verify permissions
    const isStudent = enrollment.studentId === requestorId;
    const isAdmin = requestorRole === Role.ADMIN || requestorRole === Role.SUPER_ADMIN;

    if (!isStudent && !isAdmin) {
      throw new Error('You do not have permission to drop this enrollment');
    }

    // Update status to DROPPED
    await this.enrollmentRepository.updateStatus(id, EnrollmentStatus.DROPPED);
  }

  async getStudentEnrollmentStats(studentId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    dropped: number;
  }> {
    const [total, active, completed, dropped] = await Promise.all([
      this.enrollmentRepository.countByStudent(studentId),
      this.enrollmentRepository.countByStudent(studentId, EnrollmentStatus.ACTIVE),
      this.enrollmentRepository.countByStudent(studentId, EnrollmentStatus.COMPLETED),
      this.enrollmentRepository.countByStudent(studentId, EnrollmentStatus.DROPPED),
    ]);

    return { total, active, completed, dropped };
  }

  async getCourseEnrollmentStats(courseId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    dropped: number;
  }> {
    const [total, active, completed, dropped] = await Promise.all([
      this.enrollmentRepository.countByCourse(courseId),
      this.enrollmentRepository.countByCourse(courseId, EnrollmentStatus.ACTIVE),
      this.enrollmentRepository.countByCourse(courseId, EnrollmentStatus.COMPLETED),
      this.enrollmentRepository.countByCourse(courseId, EnrollmentStatus.DROPPED),
    ]);

    return { total, active, completed, dropped };
  }

  private validateStatusTransition(
    from: EnrollmentStatus,
    to: EnrollmentStatus,
    role: Role
  ): void {
    // Students can only drop their enrollment
    if (role === Role.STUDENT && to !== EnrollmentStatus.DROPPED) {
      throw new Error('Students can only drop enrollments');
    }

    // Validate transitions
    const validTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
      [EnrollmentStatus.ACTIVE]: [
        EnrollmentStatus.COMPLETED,
        EnrollmentStatus.DROPPED,
        EnrollmentStatus.SUSPENDED,
      ],
      [EnrollmentStatus.COMPLETED]: [],
      [EnrollmentStatus.DROPPED]: [EnrollmentStatus.ACTIVE],
      [EnrollmentStatus.SUSPENDED]: [EnrollmentStatus.ACTIVE, EnrollmentStatus.DROPPED],
      [EnrollmentStatus.EXPIRED]: [EnrollmentStatus.ACTIVE],
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`Cannot transition from ${from} to ${to}`);
    }
  }
}
