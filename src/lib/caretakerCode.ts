import { randomToken } from './ids';

export const CARETAKER_CODE_PREFIX = 'CARE-';
export const MAX_ELDERS_PER_CARETAKER = 3;

export function formatCaretakerCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (cleaned.startsWith(CARETAKER_CODE_PREFIX)) return cleaned;
  if (cleaned.startsWith('CARE')) return `${CARETAKER_CODE_PREFIX}${cleaned.slice(4)}`;
  return `${CARETAKER_CODE_PREFIX}${cleaned}`;
}

export function isCaretakerCodeShaped(raw: string): boolean {
  return /^CARE-[A-Z0-9]{6}$/.test(formatCaretakerCode(raw));
}

/** Generates a code that does not collide with any code already in use. */
export function generateCaretakerCode(existing: string[]): string {
  const taken = new Set(existing.map((code) => code.toUpperCase()));
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = `${CARETAKER_CODE_PREFIX}${randomToken(6)}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${CARETAKER_CODE_PREFIX}${randomToken(6)}${randomToken(2)}`;
}
