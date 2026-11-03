import { apiClient } from './api';
import { Donation, DonationLocation } from '../types';

export interface CreateDonationPayload {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  prepDate: string;
  expiryDate: string;
  location: DonationLocation;
  description?: string;
  imageUrl?: string;
  dietaryInfo?: string[];
}

export interface GetDonationsParams {
  search?: string;
  category?: string;
  city?: string;
  status?: string;
  freshness?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  onlyAvailable?: boolean;
}

export interface DonationsResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  donations: Donation[];
}

export const donationService = {
  async getDonations(params: GetDonationsParams = {}): Promise<DonationsResponse> {
    const res = await apiClient.get<DonationsResponse>('/donations', { params });
    return res.data;
  },

  async getDonationById(id: string): Promise<{ success: boolean; donation: Donation }> {
    const res = await apiClient.get<{ success: boolean; donation: Donation }>(`/donations/${id}`);
    return res.data;
  },

  async createDonation(payload: CreateDonationPayload): Promise<{ success: boolean; message: string; donation: Donation }> {
    const res = await apiClient.post<{ success: boolean; message: string; donation: Donation }>('/donations', payload);
    return res.data;
  },

  async updateDonation(id: string, updates: Partial<CreateDonationPayload>): Promise<{ success: boolean; message: string; donation: Donation }> {
    const res = await apiClient.put<{ success: boolean; message: string; donation: Donation }>(`/donations/${id}`, updates);
    return res.data;
  },

  async deleteDonation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/donations/${id}`);
    return res.data;
  },

  async getDonorDonations(): Promise<{ success: boolean; total: number; donations: Donation[] }> {
    const res = await apiClient.get<{ success: boolean; total: number; donations: Donation[] }>('/donations/donor/my-donations');
    return res.data;
  },
};
