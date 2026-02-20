import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export interface MarkLessonCompleteRequest {
  lessonId: string;
  timeSpent?: number;
}

export const progressApi = {
  markLessonComplete: async (enrollmentId: string, data: MarkLessonCompleteRequest) => {
    const response = await apiClient.post(API_ENDPOINTS.PROGRESS.MARK_COMPLETE(enrollmentId), data);
    return response.data;
  },

  getEnrollmentProgress: async (enrollmentId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.PROGRESS.ENROLLMENT_PROGRESS(enrollmentId));
    return response.data;
  },

  getStudentCourseProgress: async (studentId: string, courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.PROGRESS.STUDENT_COURSE_PROGRESS(studentId, courseId));
    return response.data;
  },

  recalculateProgress: async (enrollmentId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.PROGRESS.RECALCULATE(enrollmentId));
    return response.data;
  },
};