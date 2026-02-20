import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export const modulesApi = {
  getByCourse: async (courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.MODULES.BY_COURSE(courseId));
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.MODULES.BY_ID(id));
    return response.data;
  },
};