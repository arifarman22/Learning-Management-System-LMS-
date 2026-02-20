// Role constants
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  INSTRUCTOR: 2,
  STUDENT: 1,
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  COURSE_EDIT: (id: string) => `/courses/${id}/edit`,
  COURSE_NEW: '/courses/new',
  COURSE_LEARN: (slug: string) => `/learn/${slug}`,
  LESSONS: '/lessons',
  LESSON_DETAIL: (id: string) => `/lessons/${id}`,
  ENROLLMENTS: '/enrollments',
  ANALYTICS: '/analytics',
  USERS: '/users',
  PROFILE: '/profile',
} as const;

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    ROLE: (id: string) => `/users/${id}/role`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    RESTORE: (id: string) => `/users/${id}/restore`,
    STATS: (id: string) => `/users/${id}/stats`,
  },
  // Courses
  COURSES: {
    BASE: '/courses',
    BY_ID: (id: string) => `/courses/${id}`,
    BY_SLUG: (slug: string) => `/courses/slug/${slug}`,
    CHANGE_STATUS: (id: string) => `/courses/${id}/status`,
    INSTRUCTOR_STATS: (id: string) => `/courses/instructor/${id}/stats`,
  },
  // Modules
  MODULES: {
    BASE: '/modules',
    BY_ID: (id: string) => `/modules/${id}`,
    BY_COURSE: (courseId: string) => `/modules/course/${courseId}`,
  },
  // Lessons
  LESSONS: {
    BASE: '/lessons',
    BY_ID: (id: string) => `/lessons/${id}`,
    BY_MODULE: (moduleId: string) => `/lessons/module/${moduleId}`,
    REORDER: '/lessons/reorder',
  },
  // Enrollments
  ENROLLMENTS: {
    BASE: '/enrollments',
    BY_ID: (id: string) => `/enrollments/${id}`,
    ENROLL: '/enrollments/enroll',
    UPDATE_STATUS: (id: string) => `/enrollments/${id}/status`,
    DROP: (id: string) => `/enrollments/${id}/drop`,
    STUDENT_STATS: (studentId: string) => `/enrollments/student/${studentId}/stats`,
    COURSE_STATS: (courseId: string) => `/enrollments/course/${courseId}/stats`,
  },
  // Progress
  PROGRESS: {
    MARK_COMPLETE: (enrollmentId: string) => `/progress/enrollments/${enrollmentId}/lessons/complete`,
    ENROLLMENT_PROGRESS: (enrollmentId: string) => `/progress/enrollments/${enrollmentId}/progress`,
    STUDENT_COURSE_PROGRESS: (studentId: string, courseId: string) =>
      `/progress/students/${studentId}/courses/${courseId}/progress`,
    RECALCULATE: (enrollmentId: string) => `/progress/enrollments/${enrollmentId}/progress/recalculate`,
  },
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ENROLLMENT_GROWTH: '/analytics/enrollments/growth',
    TOP_COURSES: '/analytics/courses/popular',
    REVENUE: '/analytics/revenue/courses',
    INSTRUCTOR_COMPLETION: '/analytics/instructors/completion-rate',
    INSTRUCTOR_DETAIL: (instructorId: string) => `/analytics/instructors/${instructorId}/completion-rate`,
  },
  // Super Admin
  SUPERADMIN: {
    SETTINGS: '/superadmin/system/settings',
    AUDIT_LOGS: '/superadmin/audit/logs',
    SECURITY_EVENTS: '/superadmin/security/events',
    REVENUE: '/superadmin/analytics/revenue',
    SUBSCRIPTIONS: '/superadmin/analytics/subscriptions',
    PAYOUTS: '/superadmin/payouts/pending',
    PERMISSIONS: '/superadmin/permissions',
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;
