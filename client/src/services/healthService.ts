import { apiClient } from './api';
import { HealthStatusResponse, DonorDashboardStats, PlatformStats, Donation, Pickup } from '../types';

export interface DonorDashboardData {
  success: boolean;
  stats: DonorDashboardStats;
  recentDonations: Donation[];
  expiringSoonDonations: Donation[];
  pendingRequests: Pickup[];
}

export const healthService = {
  async checkHealth(): Promise<HealthStatusResponse> {
    const res = await apiClient.get<HealthStatusResponse>('/health');
    return res.data;
  },

  async getPlatformStats(): Promise<{ success: boolean; stats: PlatformStats }> {
    const res = await apiClient.get<{ success: boolean; stats: PlatformStats }>('/dashboard/platform');
    return res.data;
  },

  async getDonorDashboard(): Promise<DonorDashboardData> {
    const res = await apiClient.get<DonorDashboardData>('/dashboard/donor');
    return res.data;
  },

  async seedDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>('/seed');
    return res.data;
  },
};
