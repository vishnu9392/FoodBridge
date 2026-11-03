import { PickupStatus } from '../models/Pickup';

export interface TransitionValidationResult {
  valid: boolean;
  message?: string;
  newDonationStatus?: 'available' | 'reserved' | 'completed';
}

/**
 * Pure state machine validator for pickup requests.
 * Used both in service logic and automated test suites.
 */
export function validateStatusTransition(
  currentStatus: PickupStatus,
  targetStatus: PickupStatus,
  isDonor: boolean,
  isRecipient: boolean
): TransitionValidationResult {
  if (currentStatus === targetStatus) {
    return { valid: false, message: `Pickup request is already ${targetStatus}` };
  }

  // Terminal states cannot transition
  if (['completed', 'cancelled', 'rejected'].includes(currentStatus)) {
    return {
      valid: false,
      message: `Cannot transition a pickup request that is already ${currentStatus}`,
    };
  }

  // Pending transitions
  if (currentStatus === 'pending') {
    if (targetStatus === 'approved') {
      if (!isDonor) {
        return { valid: false, message: 'Only the donation donor can approve pickup requests' };
      }
      return { valid: true, newDonationStatus: 'reserved' };
    }

    if (targetStatus === 'rejected') {
      if (!isDonor) {
        return { valid: false, message: 'Only the donation donor can reject pickup requests' };
      }
      return { valid: true, newDonationStatus: 'available' };
    }

    if (targetStatus === 'cancelled') {
      if (!isRecipient && !isDonor) {
        return { valid: false, message: 'Only participants can cancel this pickup request' };
      }
      return { valid: true, newDonationStatus: 'available' };
    }

    if (targetStatus === 'completed') {
      return { valid: false, message: 'Pickup must be approved before it can be marked completed' };
    }
  }

  // Approved transitions
  if (currentStatus === 'approved') {
    if (targetStatus === 'completed') {
      if (!isDonor && !isRecipient) {
        return { valid: false, message: 'Only the donor or recipient can mark pickup as completed' };
      }
      return { valid: true, newDonationStatus: 'completed' };
    }

    if (targetStatus === 'cancelled') {
      if (!isDonor && !isRecipient) {
        return { valid: false, message: 'Only participants can cancel an approved pickup' };
      }
      return { valid: true, newDonationStatus: 'available' };
    }

    if (targetStatus === 'pending' || targetStatus === 'rejected') {
      return {
        valid: false,
        message: `Cannot revert an approved pickup to ${targetStatus}`,
      };
    }
  }

  return { valid: false, message: `Invalid transition from ${currentStatus} to ${targetStatus}` };
}
