// User & Auth Types
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Course Types
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  categoryId?: string;
  instructorId: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  maxStudents?: number;
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Lesson Types
export enum LessonType {
  VIDEO = 'VIDEO',
  READING = 'READING',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  LIVE_SESSION = 'LIVE_SESSION',
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree: boolean;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  lastAccessedAt?: string;
  student?: User;
  course?: Course;
}

// Progress Types
export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
  lesson?: Lesson;
}

export interface CourseProgress {
  enrollmentId: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonProgress[];
}

// Analytics Types
export interface DashboardOverview {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
  };
  enrollmentGrowth: Array<{
    date: string;
    count: number;
  }>;
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    enrollmentCount: number;
    instructorName: string;
  }>;
  revenuePerCourse: Array<{
    courseId: string;
    courseTitle: string;
    totalRevenue: number;
    totalPayments: number;
    averagePrice: number;
  }>;
}

export interface InstructorAnalytics {
  instructorId: string;
  instructorName: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalCourses: number;
  courseBreakdown?: Array<{
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completed: number;
    completionRate: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}
