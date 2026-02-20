import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export interface CourseFilters {
  search?: string;
  status?: string;
  level?: string;
  categoryId?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const coursesApi = {
  getAll: async (filters?: CourseFilters) => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.BASE, { params: filters });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.BY_ID(id));
    return response.data.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.BY_SLUG(slug));
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.COURSES.BASE, data);
    return response.data.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.COURSES.BY_ID(id), data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.COURSES.BY_ID(id));
  },

  changeStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.COURSES.CHANGE_STATUS(id), { status });
    return response.data.data;
  },

  getInstructorStats: async (instructorId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.INSTRUCTOR_STATS(instructorId));
    return response.data.data;
  },
};
