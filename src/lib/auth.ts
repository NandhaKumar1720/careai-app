/**
 * DEMO-ONLY credential handling.
 * This is a local, browser-side prototype. Nothing here is production-grade
 * authentication: the hash lives in the same browser as the app, there is no
 * server, no rate limiting and no secret. Never reuse a real password here.
 */

const DEMO_SALT = 'careai-local-demo-v1';

function fallbackHash(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return `fb${(hash >>> 0).toString(16)}`;
}

export async function hashPassword(password: string): Promise<string> {
  const input = `${DEMO_SALT}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const bytes = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return fallbackHash(input);
    }
  }
  return fallbackHash(input);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Keep only digits and a leading +, so "+91 98765 43210" and "+919876543210" match. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}
