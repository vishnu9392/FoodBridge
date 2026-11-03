export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  const cleanPhone = phone.trim();
  if (cleanPhone.length < 7 || cleanPhone.length > 20) {
    return { valid: false, error: 'Phone number must be between 7 and 20 digits' };
  }
  return { valid: true };
}

export function validateQuantity(quantity: any): ValidationResult {
  const num = Number(quantity);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Quantity must be a positive number greater than 0' };
  }
  return { valid: true };
}

export function validateDonationDates(
  prepDateInput: Date | string,
  expiryDateInput: Date | string
): ValidationResult {
  const prep = new Date(prepDateInput);
  const expiry = new Date(expiryDateInput);

  if (isNaN(prep.getTime())) {
    return { valid: false, error: 'Preparation date is invalid or missing' };
  }

  if (isNaN(expiry.getTime())) {
    return { valid: false, error: 'Expiry date is invalid or missing' };
  }

  if (expiry.getTime() <= prep.getTime()) {
    return {
      valid: false,
      error: 'Expiry date and time must be later than preparation date and time',
    };
  }

  return { valid: true };
}
