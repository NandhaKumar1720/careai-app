import type { MedicineStatus, MedicineFrequency } from '../types';

export function formatTime12(time: string): string {
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = minuteRaw ?? '00';
  if (!Number.isFinite(hour)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:${minute} ${suffix}`;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function initialsFrom(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function statusLabel(status: MedicineStatus): string {
  switch (status) {
    case 'taken':
      return 'Taken';
    case 'not_taken':
      return 'Not taken';
    case 'missed':
      return 'Missed';
    case 'disabled':
      return 'Paused';
    case 'scheduled':
    default:
      return 'Pending';
  }
}

export function frequencyLabel(frequency: MedicineFrequency): string {
  switch (frequency) {
    case 'twice_daily':
      return 'Twice a day';
    case 'weekly':
      return 'Once a week';
    case 'as_needed':
      return 'Only when needed';
    case 'daily':
    default:
      return 'Every day';
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}
