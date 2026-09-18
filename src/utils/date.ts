import type { Medicine } from '../types';

/** Minutes an elder has to confirm a dose before it expires. */
export const REMINDER_WINDOW_MINUTES = 60;

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Turns "HH:mm" into a real Date on the reference day. */
export function scheduledDate(time: string, reference: Date = new Date()): Date {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const result = new Date(reference.getTime());
  result.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return result;
}

export function expiryDate(time: string, reference: Date = new Date()): Date {
  const start = scheduledDate(time, reference);
  return new Date(start.getTime() + REMINDER_WINDOW_MINUTES * 60 * 1000);
}

export function isReminderActive(time: string, now: Date = new Date()): boolean {
  const start = scheduledDate(time, now).getTime();
  const end = expiryDate(time, now).getTime();
  const current = now.getTime();
  return current >= start && current < end;
}

export function isReminderExpired(time: string, now: Date = new Date()): boolean {
  return now.getTime() >= expiryDate(time, now).getTime();
}

export function isReminderUpcoming(time: string, now: Date = new Date()): boolean {
  return now.getTime() < scheduledDate(time, now).getTime();
}

export function getMinutesUntilExpiry(time: string, now: Date = new Date()): number {
  const diffMs = expiryDate(time, now).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 60000));
}

export function getMinutesUntilDue(time: string, now: Date = new Date()): number {
  const diffMs = scheduledDate(time, now).getTime() - now.getTime();
  return Math.ceil(diffMs / 60000);
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function timeOfDay(time: string): TimeOfDay {
  const hour = Number(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function groupMedicinesByTimeOfDay(
  medicines: Medicine[],
): Record<TimeOfDay, Medicine[]> {
  const groups: Record<TimeOfDay, Medicine[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const medicine of medicines) {
    groups[timeOfDay(medicine.time)].push(medicine);
  }
  (Object.keys(groups) as TimeOfDay[]).forEach((key) => {
    groups[key].sort((a, b) => a.time.localeCompare(b.time));
  });
  return groups;
}

export function sortByTime(medicines: Medicine[]): Medicine[] {
  return [...medicines].sort((a, b) => a.time.localeCompare(b.time));
}
