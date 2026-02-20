import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export const lessonsApi = {
  getByModule: async (moduleId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.LESSONS.BY_MODULE(moduleId));
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.LESSONS.BY_ID(id));
    return response.data;
  },
};