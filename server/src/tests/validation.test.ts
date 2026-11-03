import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateQuantity,
  validateDonationDates,
} from '../utils/validation';

describe('Validation Utilities', () => {
  it('validates proper email formats', () => {
    assert.strictEqual(validateEmail('donor@foodbridge.org').valid, true);
    assert.strictEqual(validateEmail('invalid-email').valid, false);
    assert.strictEqual(validateEmail('').valid, false);
    assert.strictEqual(validateEmail('test@domain').valid, false);
  });

  it('validates password length requirements', () => {
    assert.strictEqual(validatePassword('secret123').valid, true);
    assert.strictEqual(validatePassword('12345').valid, false);
    assert.strictEqual(validatePassword('').valid, false);
  });

  it('validates phone number requirements', () => {
    assert.strictEqual(validatePhone('+1-555-0199').valid, true);
    assert.strictEqual(validatePhone('1234567890').valid, true);
    assert.strictEqual(validatePhone('123').valid, false);
  });

  it('validates positive numerical quantities', () => {
    assert.strictEqual(validateQuantity(10).valid, true);
    assert.strictEqual(validateQuantity('25.5').valid, true);
    assert.strictEqual(validateQuantity(0).valid, false);
    assert.strictEqual(validateQuantity(-5).valid, false);
    assert.strictEqual(validateQuantity('abc').valid, false);
  });

  it('enforces expiry strictly later than preparation time', () => {
    const prep = '2026-10-21T10:00:00Z';
    const validExpiry = '2026-10-21T18:00:00Z';
    const invalidExpirySame = '2026-10-21T10:00:00Z';
    const invalidExpiryPast = '2026-10-21T08:00:00Z';

    assert.strictEqual(validateDonationDates(prep, validExpiry).valid, true);
    assert.strictEqual(validateDonationDates(prep, invalidExpirySame).valid, false);
    assert.strictEqual(validateDonationDates(prep, invalidExpiryPast).valid, false);
  });
});
