import type {
  Alert,
  Elder,
  ElderSummary,
  Medicine,
  MedicineStatus,
  ReminderLog,
  User,
} from '../types';
import { createId } from './ids';
import { formatTime12 } from '../utils/formatting';
import {
  isReminderActive,
  isReminderExpired,
  isReminderUpcoming,
  sortByTime,
  todayKey,
} from '../utils/date';

export function isElder(user: User): user is Elder {
  return user.role === 'elder';
}

export function medicinesForElder(medicines: Medicine[], elderId: string): Medicine[] {
  return sortByTime(medicines.filter((medicine) => medicine.elderId === elderId));
}

/** A status only describes today; anything older resets to scheduled. */
export function rollOverToToday(medicine: Medicine, day: string = todayKey()): Medicine {
  if (medicine.statusDate === day) return medicine;
  if (medicine.status === 'disabled') return { ...medicine, statusDate: day };
  return { ...medicine, status: 'scheduled', statusDate: day };
}

export function rollOverAll(medicines: Medicine[], day: string = todayKey()): Medicine[] {
  return medicines.map((medicine) => rollOverToToday(medicine, day));
}

export function createLog(medicine: Medicine, status: MedicineStatus): ReminderLog {
  return {
    id: createId('log'),
    medicineId: medicine.id,
    medicineName: medicine.name,
    elderId: medicine.elderId,
    dose: medicine.dose,
    scheduledTime: medicine.time,
    status,
    timestamp: new Date().toISOString(),
  };
}

export function createMissedAlert(medicine: Medicine, elderName: string): Alert {
  return {
    id: createId('alert'),
    elderId: medicine.elderId,
    medicineId: medicine.id,
    severity: 'critical',
    message: `Missed medication: ${medicine.name} — ${elderName} — ${formatTime12(medicine.time)}.`,
    acknowledged: false,
    createdAt: new Date().toISOString(),
  };
}

export function createNotTakenAlert(medicine: Medicine, elderName: string): Alert {
  return {
    id: createId('alert'),
    elderId: medicine.elderId,
    medicineId: medicine.id,
    severity: 'warning',
    message: `${elderName} answered "not yet" for ${medicine.name} at ${formatTime12(medicine.time)}.`,
    acknowledged: false,
    createdAt: new Date().toISOString(),
  };
}

export interface ExpiryOutcome {
  medicines: Medicine[];
  newLogs: ReminderLog[];
  newAlerts: Alert[];
  changed: boolean;
}

/**
 * Expiry is computed from the scheduled time, not from page visibility, so a
 * reminder that lapsed while the browser was closed is still caught on load.
 */
export function applyExpiries(
  medicines: Medicine[],
  users: User[],
  now: Date = new Date(),
): ExpiryOutcome {
  const day = todayKey(now);
  const newLogs: ReminderLog[] = [];
  const newAlerts: Alert[] = [];
  let changed = false;

  const nextMedicines = medicines.map((original) => {
    const medicine = rollOverToToday(original, day);
    if (medicine !== original) changed = true;

    if (medicine.status !== 'scheduled') return medicine;
    if (!isReminderExpired(medicine.time, now)) return medicine;

    const expired: Medicine = { ...medicine, status: 'missed', statusDate: day };
    const elder = users.find((user) => user.id === medicine.elderId);
    newLogs.push(createLog(expired, 'missed'));
    newAlerts.push(createMissedAlert(expired, elder ? elder.fullName : 'Elder'));
    changed = true;
    return expired;
  });

  return { medicines: nextMedicines, newLogs, newAlerts, changed };
}

export function summarizeElder(
  elder: Elder,
  medicines: Medicine[],
  alerts: Alert[],
): ElderSummary {
  const own = medicinesForElder(medicines, elder.id).filter((m) => m.status !== 'disabled');
  const taken = own.filter((m) => m.status === 'taken').length;
  const missed = own.filter((m) => m.status === 'missed' || m.status === 'not_taken').length;
  const pending = own.filter((m) => m.status === 'scheduled').length;
  const total = own.length;
  const resolved = taken + missed;
  const adherence = resolved === 0 ? 100 : (taken / resolved) * 100;

  return {
    elder,
    medicines: own,
    taken,
    missed,
    pending,
    total,
    adherence,
    openAlerts: alerts.filter((alert) => alert.elderId === elder.id && !alert.acknowledged),
  };
}

export function nextMedicine(medicines: Medicine[], now: Date = new Date()): Medicine | null {
  const candidates = sortByTime(
    medicines.filter((medicine) => medicine.status === 'scheduled'),
  );
  const active = candidates.find((medicine) => isReminderActive(medicine.time, now));
  if (active) return active;
  const upcoming = candidates.find((medicine) => isReminderUpcoming(medicine.time, now));
  return upcoming ?? null;
}

/** The medicine whose confirmation window is open right now. */
export function dueMedicine(medicines: Medicine[], now: Date = new Date()): Medicine | null {
  return (
    sortByTime(medicines).find(
      (medicine) => medicine.status === 'scheduled' && isReminderActive(medicine.time, now),
    ) ?? null
  );
}

export function canRespondTo(medicine: Medicine, now: Date = new Date()): boolean {
  if (medicine.status !== 'scheduled') return false;
  return !isReminderExpired(medicine.time, now);
}
