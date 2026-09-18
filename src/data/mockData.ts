import type {
  Alert,
  Medicine,
  Relationship,
  ReminderLog,
  User,
} from '../types';
import { todayKey } from '../utils/date';

/**
 * Seed data only.
 *
 * A browser React app cannot rewrite this TypeScript file at runtime, so this
 * module is read exactly once — the first time CareAI opens on a device — and
 * copied into IndexedDB. Afterwards the app always loads the persisted data,
 * and nothing here overwrites what the user has done.
 */

export type SeedUser = Omit<User, 'passwordHash'> & { password: string };

const NOW = new Date();
const TODAY = todayKey(NOW);

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const SEED_CARETAKER_ID = 'user_seed_caretaker_meera';
export const SEED_ELDER_RAVI_ID = 'user_seed_elder_ravi';
export const SEED_ELDER_LAKSHMI_ID = 'user_seed_elder_lakshmi';

export const seedUsers: SeedUser[] = [
  {
    id: SEED_CARETAKER_ID,
    fullName: 'Meera Krishnan',
    username: 'meera.care',
    email: 'meera@careai.demo',
    phone: '+919876500001',
    password: 'caretaker1',
    role: 'caretaker',
    avatarId: null,
    emergencyContactName: 'Vellore Community Clinic',
    emergencyContactPhone: '+914162200100',
    caretakerCode: 'CARE-7F29K4',
    age: 38,
    createdAt: daysAgo(40),
  },
  {
    id: SEED_ELDER_RAVI_ID,
    fullName: 'Ravi Kumar',
    username: 'ravi.kumar',
    email: 'ravi@careai.demo',
    phone: '+919876500002',
    password: 'elderpass1',
    role: 'elder',
    avatarId: null,
    emergencyContactName: 'Meera Krishnan (caretaker)',
    emergencyContactPhone: '+919876500001',
    caretakerCode: null,
    age: 74,
    createdAt: daysAgo(38),
  },
  {
    id: SEED_ELDER_LAKSHMI_ID,
    fullName: 'Lakshmi Iyer',
    username: 'lakshmi.iyer',
    email: 'lakshmi@careai.demo',
    phone: '+919876500003',
    password: 'elderpass2',
    role: 'elder',
    avatarId: null,
    emergencyContactName: 'Arun Iyer (son)',
    emergencyContactPhone: '+919876500009',
    caretakerCode: null,
    age: 69,
    createdAt: daysAgo(30),
  },
];

export const seedRelationships: Relationship[] = [
  {
    id: 'rel_seed_ravi',
    elderId: SEED_ELDER_RAVI_ID,
    caretakerId: SEED_CARETAKER_ID,
    createdAt: daysAgo(38),
  },
  {
    id: 'rel_seed_lakshmi',
    elderId: SEED_ELDER_LAKSHMI_ID,
    caretakerId: SEED_CARETAKER_ID,
    createdAt: daysAgo(30),
  },
];

export const seedMedicines: Medicine[] = [
  {
    id: 'med_seed_1',
    elderId: SEED_ELDER_RAVI_ID,
    name: 'Amlodipine',
    dose: '5 mg',
    time: '08:00',
    status: 'scheduled',
    frequency: 'daily',
    notes: 'Take after breakfast with water.',
    statusDate: TODAY,
    createdAt: daysAgo(38),
  },
  {
    id: 'med_seed_2',
    elderId: SEED_ELDER_RAVI_ID,
    name: 'Metformin',
    dose: '500 mg',
    time: '13:00',
    status: 'scheduled',
    frequency: 'twice_daily',
    notes: 'Take with lunch.',
    statusDate: TODAY,
    createdAt: daysAgo(38),
  },
  {
    id: 'med_seed_3',
    elderId: SEED_ELDER_RAVI_ID,
    name: 'Vitamin D',
    dose: '1 tablet',
    time: '20:00',
    status: 'scheduled',
    frequency: 'daily',
    notes: '',
    statusDate: TODAY,
    createdAt: daysAgo(20),
  },
  {
    id: 'med_seed_4',
    elderId: SEED_ELDER_LAKSHMI_ID,
    name: 'Levothyroxine',
    dose: '50 mcg',
    time: '07:00',
    status: 'scheduled',
    frequency: 'daily',
    notes: 'Empty stomach, 30 minutes before food.',
    statusDate: TODAY,
    createdAt: daysAgo(30),
  },
  {
    id: 'med_seed_5',
    elderId: SEED_ELDER_LAKSHMI_ID,
    name: 'Calcium + D3',
    dose: '1 tablet',
    time: '14:00',
    status: 'scheduled',
    frequency: 'daily',
    notes: '',
    statusDate: TODAY,
    createdAt: daysAgo(25),
  },
  {
    id: 'med_seed_6',
    elderId: SEED_ELDER_LAKSHMI_ID,
    name: 'Atorvastatin',
    dose: '10 mg',
    time: '21:00',
    status: 'scheduled',
    frequency: 'daily',
    notes: 'Take at bedtime.',
    statusDate: TODAY,
    createdAt: daysAgo(25),
  },
];

export const seedLogs: ReminderLog[] = [
  {
    id: 'log_seed_1',
    medicineId: 'med_seed_1',
    medicineName: 'Amlodipine',
    elderId: SEED_ELDER_RAVI_ID,
    dose: '5 mg',
    scheduledTime: '08:00',
    status: 'taken',
    timestamp: hoursAgo(26),
  },
  {
    id: 'log_seed_2',
    medicineId: 'med_seed_2',
    medicineName: 'Metformin',
    elderId: SEED_ELDER_RAVI_ID,
    dose: '500 mg',
    scheduledTime: '13:00',
    status: 'taken',
    timestamp: hoursAgo(25),
  },
  {
    id: 'log_seed_3',
    medicineId: 'med_seed_3',
    medicineName: 'Vitamin D',
    elderId: SEED_ELDER_RAVI_ID,
    dose: '1 tablet',
    scheduledTime: '20:00',
    status: 'missed',
    timestamp: hoursAgo(24),
  },
  {
    id: 'log_seed_4',
    medicineId: 'med_seed_4',
    medicineName: 'Levothyroxine',
    elderId: SEED_ELDER_LAKSHMI_ID,
    dose: '50 mcg',
    scheduledTime: '07:00',
    status: 'taken',
    timestamp: hoursAgo(27),
  },
  {
    id: 'log_seed_5',
    medicineId: 'med_seed_6',
    medicineName: 'Atorvastatin',
    elderId: SEED_ELDER_LAKSHMI_ID,
    dose: '10 mg',
    scheduledTime: '21:00',
    status: 'missed',
    timestamp: hoursAgo(23),
  },
];

export const seedAlerts: Alert[] = [
  {
    id: 'alert_seed_1',
    elderId: SEED_ELDER_RAVI_ID,
    medicineId: 'med_seed_3',
    severity: 'critical',
    message: 'Missed medication: Vitamin D — Ravi Kumar — 8:00 PM yesterday.',
    acknowledged: false,
    createdAt: hoursAgo(24),
  },
  {
    id: 'alert_seed_2',
    elderId: SEED_ELDER_LAKSHMI_ID,
    medicineId: 'med_seed_6',
    severity: 'warning',
    message: 'Atorvastatin was not confirmed by Lakshmi Iyer last night.',
    acknowledged: false,
    createdAt: hoursAgo(23),
  },
];

/** Shown on the login screen so the demo can be opened without signing up. */
export const demoCredentials = [
  { role: 'Caretaker', email: 'meera@careai.demo', password: 'caretaker1' },
  { role: 'Elder', email: 'ravi@careai.demo', password: 'elderpass1' },
  { role: 'Elder', email: 'lakshmi@careai.demo', password: 'elderpass2' },
];
