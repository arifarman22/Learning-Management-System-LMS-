import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';

export const analyticsApi = {
  getDashboard: async (days: number = 10) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params: { days } });
    return response.data;
  },

  getInstructorCompletion: async (instructorId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.INSTRUCTOR_DETAIL(instructorId));
    return response.data;
  },
};
