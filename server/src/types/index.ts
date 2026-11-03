import { Request } from 'express';

export type UserRole = 'donor' | 'recipient' | 'admin';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Bakery & Bread'
  | 'Fresh Produce'
  | 'Dairy & Eggs'
  | 'Packaged & Canned'
  | 'Beverages'
  | 'Other';

export type QuantityUnit = 'kg' | 'portions' | 'boxes' | 'items' | 'litres';

export type DonationStatus = 'available' | 'reserved' | 'completed' | 'expired' | 'cancelled';

export type ExpiryStatus = 'fresh' | 'expiring_soon' | 'expired';

export type PickupStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export interface CustomError extends Error {
  statusCode?: number;
  errors?: Record<string, string>;
}
