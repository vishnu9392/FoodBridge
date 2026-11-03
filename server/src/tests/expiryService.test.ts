import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateExpiryStatus,
  getTimeRemaining,
  estimateShelfLife,
} from '../services/expiryService';

describe('Food Expiry Rule Engine', () => {
  const referenceNow = new Date('2026-10-21T12:00:00Z');

  it('marks timestamps in the past as expired', () => {
    const pastDate = new Date('2026-10-21T10:00:00Z'); // 2 hours ago
    const status = calculateExpiryStatus(pastDate, referenceNow);
    assert.strictEqual(status, 'expired');
  });

  it('marks timestamps within 24 hours as expiring_soon', () => {
    const soonDate = new Date('2026-10-21T20:00:00Z'); // 8 hours in future
    const status = calculateExpiryStatus(soonDate, referenceNow);
    assert.strictEqual(status, 'expiring_soon');

    const edgeSoon = new Date('2026-10-22T11:59:00Z'); // 23h 59m in future
    assert.strictEqual(calculateExpiryStatus(edgeSoon, referenceNow), 'expiring_soon');
  });

  it('marks timestamps greater than 24 hours as fresh', () => {
    const futureDate = new Date('2026-10-22T14:00:00Z'); // 26 hours in future
    const status = calculateExpiryStatus(futureDate, referenceNow);
    assert.strictEqual(status, 'fresh');

    const nextWeek = new Date('2026-10-28T12:00:00Z');
    assert.strictEqual(calculateExpiryStatus(nextWeek, referenceNow), 'fresh');
  });

  it('handles invalid or unparseable timestamps safely as expired', () => {
    assert.strictEqual(calculateExpiryStatus('invalid-date', referenceNow), 'expired');
    assert.strictEqual(calculateExpiryStatus('', referenceNow), 'expired');
  });

  it('calculates remaining time breakdown accurately', () => {
    const fourHoursAhead = new Date('2026-10-21T16:30:00Z');
    const result = getTimeRemaining(fourHoursAhead, referenceNow);

    assert.strictEqual(result.status, 'expiring_soon');
    assert.strictEqual(result.hoursRemaining, 4);
    assert.strictEqual(result.minutesRemaining, 30);
    assert.strictEqual(result.isExpired, false);
    assert.strictEqual(result.humanReadable, '4h 30m left');
  });

  it('correctly reports days remaining for distant dates', () => {
    const fiveDaysAhead = new Date('2026-10-26T12:00:00Z'); // 5 days
    const result = getTimeRemaining(fiveDaysAhead, referenceNow);

    assert.strictEqual(result.status, 'fresh');
    assert.strictEqual(result.humanReadable, '5 days left');
  });

  it('estimates shelf life by storage condition properly', () => {
    const estimate = estimateShelfLife({
      category: 'Cooked Meals',
      preparationDate: '2026-10-21T12:00:00Z',
      storageCondition: 'refrigerated',
    });

    assert.strictEqual(estimate.category, 'Cooked Meals');
    assert.strictEqual(estimate.storageCondition, 'refrigerated');
    assert.strictEqual(estimate.estimatedShelfLifeHours, 72);
    assert.ok(estimate.foodSafetyNotes.includes('chilled'));
    assert.ok(estimate.disclaimer.includes('Notice:'));
  });
});
