import { apiClient } from './api';
import { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'donor' | 'recipient';
  organization?: string;
  address?: string;
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    const res = await apiClient.put<{ success: boolean; message: string; user: User }>('/auth/profile', updates);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.put<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
