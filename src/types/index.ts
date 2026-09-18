export type UserRole = 'elder' | 'caretaker';

export type MedicineStatus =
  | 'scheduled'
  | 'taken'
  | 'not_taken'
  | 'missed'
  | 'disabled';

export type MedicineFrequency = 'daily' | 'twice_daily' | 'weekly' | 'as_needed';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatarId: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  /** Present only for caretakers. */
  caretakerCode: string | null;
  age: number | null;
  createdAt: string;
}

export type Elder = User & { role: 'elder' };
export type Caretaker = User & { role: 'caretaker' };

export interface Relationship {
  id: string;
  elderId: string;
  caretakerId: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  elderId: string;
  name: string;
  dose: string;
  /** 24-hour "HH:mm". */
  time: string;
  status: MedicineStatus;
  frequency: MedicineFrequency;
  notes: string;
  /** "YYYY-MM-DD" of the day the current status belongs to. */
  statusDate: string;
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  medicineId: string;
  medicineName: string;
  elderId: string;
  dose: string;
  scheduledTime: string;
  status: MedicineStatus;
  timestamp: string;
}

export interface Alert {
  id: string;
  elderId: string;
  medicineId: string | null;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AppSettings {
  id: string;
  seeded: boolean;
  sessionUserId: string | null;
  rememberedEmail: string | null;
}

export interface AvatarRecord {
  id: string;
  dataUrl: string;
}

export interface SignupInput {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  emergencyContactName: string;
  emergencyContactPhone: string;
  age: number | null;
  avatarDataUrl: string | null;
  caretakerCode: string;
}

export interface MedicineInput {
  elderId: string;
  name: string;
  dose: string;
  time: string;
  frequency: MedicineFrequency;
  notes: string;
}

export type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ElderSummary {
  elder: Elder;
  medicines: Medicine[];
  taken: number;
  missed: number;
  pending: number;
  total: number;
  adherence: number;
  openAlerts: Alert[];
}

export type ToastKind = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description: string;
  sticky: boolean;
}
