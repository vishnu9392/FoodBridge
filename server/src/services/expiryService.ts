export type ExpiryStatus = 'fresh' | 'expiring_soon' | 'expired';

export interface TimeRemainingInfo {
  status: ExpiryStatus;
  hoursRemaining: number;
  minutesRemaining: number;
  isExpired: boolean;
  humanReadable: string;
}

export interface ShelfLifeEstimateInput {
  category: string;
  preparationDate: Date | string;
  storageCondition: 'room_temperature' | 'refrigerated' | 'frozen';
}

export interface ShelfLifeEstimateResult {
  category: string;
  storageCondition: string;
  estimatedShelfLifeHours: number;
  suggestedExpiryDate: string;
  foodSafetyNotes: string;
  disclaimer: string;
}

export const FOOD_SAFETY_DISCLAIMER =
  'Notice: Expiry status calculations are date-based estimates to assist in timely food rescue triage. They do not constitute a laboratory food safety certification. Always perform sensory checks (appearance, aroma, temperature) and adhere to local public health regulations before distributing or consuming food.';

/**
 * Calculates rule-based expiry status based on expiryDate and current time
 * - Expired: expiry timestamp has passed
 * - Expiring Soon: expires within the next 24 hours
 * - Fresh: more than 24 hours remain
 */
export function calculateExpiryStatus(
  expiryDate: Date | string | number,
  now: Date = new Date()
): ExpiryStatus {
  const expiry = new Date(expiryDate);
  const currentTime = now.getTime();

  if (isNaN(expiry.getTime())) {
    return 'expired';
  }

  const diffMs = expiry.getTime() - currentTime;

  if (diffMs <= 0) {
    return 'expired';
  }

  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  if (diffMs <= twentyFourHoursMs) {
    return 'expiring_soon';
  }

  return 'fresh';
}

/**
 * Returns detailed time breakdown and human-friendly description
 */
export function getTimeRemaining(
  expiryDate: Date | string | number,
  now: Date = new Date()
): TimeRemainingInfo {
  const expiry = new Date(expiryDate);
  const currentTime = now.getTime();
  const status = calculateExpiryStatus(expiryDate, now);

  if (isNaN(expiry.getTime())) {
    return {
      status: 'expired',
      hoursRemaining: 0,
      minutesRemaining: 0,
      isExpired: true,
      humanReadable: 'Invalid expiry date',
    };
  }

  const diffMs = expiry.getTime() - currentTime;

  if (diffMs <= 0) {
    const elapsedMinutes = Math.floor(Math.abs(diffMs) / (60 * 1000));
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const label =
      elapsedHours > 0
        ? `Expired ${elapsedHours}h ago`
        : `Expired ${elapsedMinutes}m ago`;

    return {
      status: 'expired',
      hoursRemaining: 0,
      minutesRemaining: 0,
      isExpired: true,
      humanReadable: label,
    };
  }

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let humanReadable = '';
  if (hours > 48) {
    const days = Math.floor(hours / 24);
    humanReadable = `${days} days left`;
  } else if (hours > 0) {
    humanReadable = `${hours}h ${minutes}m left`;
  } else {
    humanReadable = `${minutes}m left`;
  }

  return {
    status,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    isExpired: false,
    humanReadable,
  };
}

/**
 * Shelf-life duration guidelines in hours for various categories and storage types
 */
const SHELF_LIFE_MATRIX: Record<
  string,
  { room_temperature: number; refrigerated: number; frozen: number; notes: string }
> = {
  'Cooked Meals': {
    room_temperature: 4,
    refrigerated: 72,
    frozen: 2160, // 90 days
    notes: 'Keep chilled below 4°C. Reheat to at least 74°C before serving.',
  },
  'Bakery & Bread': {
    room_temperature: 48,
    refrigerated: 120,
    frozen: 1440, // 60 days
    notes: 'Store in dry, sealed containers to prevent moisture accumulation and mold.',
  },
  'Fresh Produce': {
    room_temperature: 72,
    refrigerated: 168, // 7 days
    frozen: 4320, // 180 days
    notes: 'Wash thoroughly with clean water before sorting or packaging.',
  },
  'Dairy & Eggs': {
    room_temperature: 2,
    refrigerated: 120, // 5 days
    frozen: 720, // 30 days
    notes: 'Do not leave at room temperature. Keep strictly chilled below 4°C.',
  },
  'Packaged & Canned': {
    room_temperature: 8760, // 365 days
    refrigerated: 8760,
    frozen: 8760,
    notes: 'Check can seams for bulging, rust, or puncture dents.',
  },
  'Beverages': {
    room_temperature: 24,
    refrigerated: 120,
    frozen: 720,
    notes: 'Once unsealed, keep tightly capped and refrigerated.',
  },
  'Other': {
    room_temperature: 12,
    refrigerated: 72,
    frozen: 720,
    notes: 'Follow specific producer guidance or standard perishable rules.',
  },
};

/**
 * Calculates estimated safe shelf-life and recommended expiry date
 */
export function estimateShelfLife(input: ShelfLifeEstimateInput): ShelfLifeEstimateResult {
  const categoryData =
    SHELF_LIFE_MATRIX[input.category] || SHELF_LIFE_MATRIX['Other'];

  const prepDate = new Date(input.preparationDate);
  const baseTime = isNaN(prepDate.getTime()) ? new Date() : prepDate;

  const hours = categoryData[input.storageCondition] || 24;
  const suggestedExpiry = new Date(baseTime.getTime() + hours * 60 * 60 * 1000);

  return {
    category: input.category,
    storageCondition: input.storageCondition,
    estimatedShelfLifeHours: hours,
    suggestedExpiryDate: suggestedExpiry.toISOString(),
    foodSafetyNotes: categoryData.notes,
    disclaimer: FOOD_SAFETY_DISCLAIMER,
  };
}
