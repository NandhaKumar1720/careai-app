export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,20}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address, like name@example.com.';
  return null;
}

export function validateUsername(value: string): string | null {
  if (!value.trim()) return 'Choose a username.';
  if (!USERNAME_PATTERN.test(value.trim()))
    return 'Use 3 to 20 letters, numbers, dots, dashes or underscores.';
  return null;
}

export function validateFullName(value: string): string | null {
  if (!value.trim()) return 'Enter your full name.';
  if (value.trim().length < 2) return 'Your name needs at least 2 letters.';
  return null;
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return 'Enter a phone number.';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 'Enter a phone number with 8 to 15 digits.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Create a password.';
  if (value.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
    return 'Include at least one letter and one number.';
  return null;
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  if (!confirm) return 'Type your password again.';
  if (password !== confirm) return 'Both passwords must match.';
  return null;
}

export function validateMedicineName(value: string): string | null {
  if (!value.trim()) return 'Enter the medicine name.';
  if (value.trim().length < 2) return 'Medicine names need at least 2 letters.';
  return null;
}

export function validateDose(value: string): string | null {
  if (!value.trim()) return 'Enter the dose, for example 5 mg or 1 tablet.';
  return null;
}

export function validateTime(value: string): string | null {
  if (!value.trim()) return 'Choose a time.';
  if (!TIME_PATTERN.test(value.trim())) return 'Use a 24-hour time, like 08:00 or 20:30.';
  return null;
}

export function validateAge(value: string): string | null {
  if (!value.trim()) return null;
  const age = Number(value);
  if (!Number.isInteger(age) || age < 1 || age > 120) return 'Enter an age between 1 and 120.';
  return null;
}

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Choose a PNG, JPG or WEBP image.';
  if (file.size > MAX_AVATAR_BYTES) return 'Choose an image smaller than 5 MB.';
  return null;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
