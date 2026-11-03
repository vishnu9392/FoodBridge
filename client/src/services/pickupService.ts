import { apiClient } from './api';
import { Pickup, PickupStatus } from '../types';

export interface CreatePickupPayload {
  donationId: string;
  requestedQuantity?: number;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  requestedPickupTime?: string;
}

export const pickupService = {
  async createPickupRequest(payload: CreatePickupPayload): Promise<{ success: boolean; message: string; pickup: Pickup }> {
    const res = await apiClient.post<{ success: boolean; message: string; pickup: Pickup }>('/pickups', payload);
    return res.data;
  },

  async getPickups(role?: 'recipient' | 'donor' | 'all', status?: string): Promise<{ success: boolean; total: number; pickups: Pickup[] }> {
    const res = await apiClient.get<{ success: boolean; total: number; pickups: Pickup[] }>('/pickups', {
      params: { role, status },
    });
    return res.data;
  },

  async getPickupById(id: string): Promise<{ success: boolean; pickup: Pickup }> {
    const res = await apiClient.get<{ success: boolean; pickup: Pickup }>(`/pickups/${id}`);
    return res.data;
  },

  async updatePickupStatus(
    id: string,
    status: PickupStatus,
    reason?: string
  ): Promise<{ success: boolean; message: string; pickup: Pickup }> {
    const res = await apiClient.patch<{ success: boolean; message: string; pickup: Pickup }>(
      `/pickups/${id}/status`,
      { status, reason }
    );
    return res.data;
  },
};
