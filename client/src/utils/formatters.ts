/**
 * Centralized formatting utilities for FoodBridge client.
 */

/**
 * Formats an ISO date string into a user-friendly date (e.g. "Nov 3, 2026").
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Formats an ISO date string into date with time (e.g. "Nov 3, 2026, 2:30 PM").
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Formats a quantity with its unit (e.g. "15 kg", "30 portions").
 */
export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString()} ${unit}`;
}

/**
 * Formats distance in km or meters cleanly.
 */
export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null || isNaN(km)) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Capitalizes the first letter of each word in a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safely truncates text to a specified maximum length with an ellipsis.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}
