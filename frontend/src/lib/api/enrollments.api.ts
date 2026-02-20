import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export interface EnrollmentFilters {
  status?: string;
  courseId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export const enrollmentsApi = {
  getAll: async (filters?: EnrollmentFilters) => {
    const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.BASE, { params: filters });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.BY_ID(id));
    return response.data.data;
  },

  enroll: async (courseId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS.BASE, { courseId });
    return response.data.data;
  },

  drop: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS.DROP(id));
    return response.data;
  },

  getStudentStats: async (studentId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.STUDENT_STATS(studentId));
    return response.data.data;
  },

  getCourseStats: async (courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.COURSE_STATS(courseId));
    return response.data.data;
  },
};
