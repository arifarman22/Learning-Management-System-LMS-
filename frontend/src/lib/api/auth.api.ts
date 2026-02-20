import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import { User } from '@/types';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }).catch(() => {});
    }
  },
};
