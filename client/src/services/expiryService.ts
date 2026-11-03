import { apiClient } from './api';
import { Donation, ShelfLifeEstimateResult } from '../types';

export interface ExpiryAnalyticsResponse {
  success: boolean;
  counts: {
    fresh: number;
    expiringSoon: number;
    expired: number;
    totalActive: number;
  };
  expiringSoonListings: Donation[];
  disclaimer: string;
}

export const expiryService = {
  async getExpiryAnalytics(): Promise<ExpiryAnalyticsResponse> {
    const res = await apiClient.get<ExpiryAnalyticsResponse>('/expiry/analytics');
    return res.data;
  },

  async estimateShelfLife(payload: {
    category: string;
    preparationDate?: string;
    storageCondition: 'room_temperature' | 'refrigerated' | 'frozen';
  }): Promise<{ success: boolean; result: ShelfLifeEstimateResult }> {
    const res = await apiClient.post<{ success: boolean; result: ShelfLifeEstimateResult }>('/expiry/estimate', payload);
    return res.data;
  },
};
