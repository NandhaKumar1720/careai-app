import type { MedicineStatus } from '../types';
import { statusLabel } from './formatting';

/** Focusable selectors used by the modal focus trap. */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0,
  );
}

/** Never rely on colour alone: every status also gets words. */
export function describeMedicine(name: string, dose: string, time12: string, status: MedicineStatus): string {
  return `${name}, ${dose}, scheduled for ${time12}. Status: ${statusLabel(status)}.`;
}

export function srOnlyClass(): string {
  return 'sr-only';
}
