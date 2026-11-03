export type UserRole = 'donor' | 'recipient' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  address?: string;
  bio?: string;
  createdAt?: string;
}

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

export interface TimeRemainingInfo {
  status: ExpiryStatus;
  hoursRemaining: number;
  minutesRemaining: number;
  isExpired: boolean;
  humanReadable: string;
}

export interface DonationLocation {
  address: string;
  locality?: string;
  city: string;
  state?: string;
  postalCode?: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isApproximate?: boolean;
}

export interface Donation {
  id: string;
  donor: {
    id: string;
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    organization?: string;
    address?: string;
  };
  foodName: string;
  category: FoodCategory;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  unit: QuantityUnit;
  prepDate: string;
  expiryDate: string;
  location: DonationLocation;
  description: string;
  imageUrl: string;
  dietaryInfo: string[];
  status: DonationStatus;
  expiryStatus?: ExpiryStatus;
  timeRemaining?: TimeRemainingInfo;
  isAuthorizedContact?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PickupStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

export interface Pickup {
  id: string;
  donation: Donation;
  recipient: User;
  donor: User;
  status: PickupStatus;
  requestedQuantity: number;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  requestedPickupTime?: string;
  approvedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonorDashboardStats {
  totalDonations: number;
  activeDonations: number;
  completedPickups: number;
  pendingPickupRequests: number;
  expiringSoonCount: number;
}

export interface PlatformStats {
  totalDonations: number;
  completedPickups: number;
  activeListings: number;
  totalDonors: number;
  totalRecipients: number;
  estimatedKgRescued: number;
  mealsProvided: number;
  co2PreventedKg: number;
}

export interface ShelfLifeEstimateResult {
  category: string;
  storageCondition: string;
  estimatedShelfLifeHours: number;
  suggestedExpiryDate: string;
  foodSafetyNotes: string;
  disclaimer: string;
}

export interface HealthStatusResponse {
  status: 'healthy' | 'degraded';
  server: {
    uptimeSeconds: number;
    timestamp: string;
    nodeVersion: string;
  };
  database: {
    connected: boolean;
    state: string;
    databaseName: string | null;
    setupRequired: boolean;
    message: string;
  };
}
