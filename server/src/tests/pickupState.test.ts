import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateStatusTransition } from '../services/pickupService';

describe('Pickup State Machine Transitions', () => {
  it('allows donors to approve a pending pickup request', () => {
    const result = validateStatusTransition('pending', 'approved', true, false);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.newDonationStatus, 'reserved');
  });

  it('prevents non-donors from approving a pending request', () => {
    const result = validateStatusTransition('pending', 'approved', false, true);
    assert.strictEqual(result.valid, false);
    assert.ok(result.message?.includes('Only the donation donor can approve'));
  });

  it('allows donors to reject a pending pickup request', () => {
    const result = validateStatusTransition('pending', 'rejected', true, false);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.newDonationStatus, 'available');
  });

  it('allows recipients to cancel a pending pickup request', () => {
    const result = validateStatusTransition('pending', 'cancelled', false, true);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.newDonationStatus, 'available');
  });

  it('prevents direct transition from pending to completed without approval', () => {
    const result = validateStatusTransition('pending', 'completed', true, false);
    assert.strictEqual(result.valid, false);
  });

  it('allows donor or recipient to complete an approved pickup', () => {
    const resultDonor = validateStatusTransition('approved', 'completed', true, false);
    assert.strictEqual(resultDonor.valid, true);
    assert.strictEqual(resultDonor.newDonationStatus, 'completed');

    const resultRecipient = validateStatusTransition('approved', 'completed', false, true);
    assert.strictEqual(resultRecipient.valid, true);
  });

  it('allows participants to cancel an approved pickup', () => {
    const result = validateStatusTransition('approved', 'cancelled', true, false);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.newDonationStatus, 'available');
  });

  it('prevents transitions from terminal states', () => {
    assert.strictEqual(
      validateStatusTransition('completed', 'approved', true, true).valid,
      false
    );
    assert.strictEqual(
      validateStatusTransition('cancelled', 'pending', true, true).valid,
      false
    );
    assert.strictEqual(
      validateStatusTransition('rejected', 'approved', true, true).valid,
      false
    );
  });
});
