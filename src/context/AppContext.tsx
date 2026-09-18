import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Alert,
  Caretaker,
  ChatMessage,
  Elder,
  ElderSummary,
  Medicine,
  MedicineInput,
  MedicineStatus,
  Relationship,
  ReminderLog,
  Result,
  SignupInput,
  User,
  UserRole,
} from '../types';
import {
  seedAlerts,
  seedLogs,
  seedMedicines,
  seedRelationships,
  seedUsers,
} from '../data/mockData';
import { createId, randomToken } from '../lib/ids';
import {
  hashPassword,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
  verifyPassword,
} from '../lib/auth';
import {
  MAX_ELDERS_PER_CARETAKER,
  formatCaretakerCode,
  generateCaretakerCode,
  isCaretakerCodeShaped,
} from '../lib/caretakerCode';
import {
  applyExpiries,
  createLog,
  createNotTakenAlert,
  medicinesForElder,
  rollOverAll,
  summarizeElder,
} from '../lib/medication';
import { answerCareAI } from '../lib/careai';
import { todayKey } from '../utils/date';
import { userRepository } from '../lib/storage/userRepository';
import { medicineRepository } from '../lib/storage/medicineRepository';
import { reminderRepository } from '../lib/storage/reminderRepository';
import { alertRepository } from '../lib/storage/alertRepository';
import { relationshipRepository } from '../lib/storage/relationshipRepository';
import { chatRepository } from '../lib/storage/chatRepository';
import { avatarRepository } from '../lib/storage/avatarRepository';
import { settingsRepository } from '../lib/storage/settingsRepository';

export interface AppContextValue {
  ready: boolean;
  loadError: string | null;
  currentUser: User | null;
  currentRole: UserRole | null;
  rememberedEmail: string | null;
  users: User[];
  medicines: Medicine[];
  logs: ReminderLog[];
  alerts: Alert[];
  relationships: Relationship[];
  avatars: Record<string, string>;
  chat: ChatMessage[];

  login: (email: string, password: string, role: UserRole, remember: boolean) => Promise<Result>;
  logout: () => Promise<void>;
  signup: (input: SignupInput) => Promise<Result<User>>;
  requestPasswordReset: (email: string) => Promise<Result<string>>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<Result>;
  updateProfile: (
    patch: Partial<Pick<User, 'fullName' | 'username' | 'email' | 'phone' | 'emergencyContactName' | 'emergencyContactPhone' | 'age'>>,
    avatar?: { dataUrl: string | null },
  ) => Promise<Result>;

  connectElderToCaretaker: (code: string) => Promise<Result<Caretaker>>;
  disconnectCaretaker: () => Promise<Result>;
  regenerateCaretakerCode: () => Promise<Result<string>>;

  addMedicine: (input: MedicineInput) => Promise<Result<Medicine>>;
  updateMedicine: (id: string, patch: Partial<MedicineInput> & { status?: MedicineStatus }) => Promise<Result>;
  deleteMedicine: (id: string) => Promise<Result>;
  markMedicineStatus: (id: string, status: MedicineStatus) => Promise<Result>;
  acknowledgeAlert: (id: string) => Promise<Result>;

  sendChatMessage: (text: string) => Promise<void>;
  runExpiryCheck: () => Promise<void>;

  elderFor: (elderId: string) => Elder | null;
  caretakerForElder: (elderId: string) => Caretaker | null;
  eldersForCaretaker: (caretakerId: string) => Elder[];
  summariesForCaretaker: (caretakerId: string) => ElderSummary[];
  medicinesFor: (elderId: string) => Medicine[];
}

export const AppContext = createContext<AppContextValue | null>(null);

const RESET_CODE_TTL_MS = 10 * 60 * 1000;

interface PendingReset {
  userId: string;
  code: string;
  expiresAt: number;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const pendingResets = useRef<Map<string, PendingReset>>(new Map());

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  /* ---------------------------------------------------------------- boot */

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const settings = await settingsRepository.read();

        if (!settings.seeded) {
          const hashedUsers: User[] = await Promise.all(
            seedUsers.map(async ({ password, ...rest }) => ({
              ...rest,
              passwordHash: await hashPassword(password),
            })),
          );
          await userRepository.saveMany(hashedUsers);
          await medicineRepository.saveMany(seedMedicines);
          await reminderRepository.saveMany(seedLogs);
          await alertRepository.saveMany(seedAlerts);
          await relationshipRepository.saveMany(seedRelationships);
          await settingsRepository.write({ seeded: true });
        }

        const [
          loadedUsers,
          loadedMedicines,
          loadedLogs,
          loadedAlerts,
          loadedRelationships,
          loadedChat,
          loadedAvatars,
        ] = await Promise.all([
          userRepository.list(),
          medicineRepository.list(),
          reminderRepository.list(),
          alertRepository.list(),
          relationshipRepository.list(),
          chatRepository.list(),
          avatarRepository.list(),
        ]);

        if (cancelled) return;

        const rolled = rollOverAll(loadedMedicines);
        const outcome = applyExpiries(rolled, loadedUsers);
        if (outcome.changed) {
          await medicineRepository.saveMany(outcome.medicines);
          if (outcome.newLogs.length) await reminderRepository.saveMany(outcome.newLogs);
          if (outcome.newAlerts.length) await alertRepository.saveMany(outcome.newAlerts);
        }

        const avatarMap: Record<string, string> = {};
        loadedAvatars.forEach((avatar) => {
          avatarMap[avatar.id] = avatar.dataUrl;
        });

        setUsers(loadedUsers);
        setMedicines(outcome.medicines);
        setLogs([...loadedLogs, ...outcome.newLogs]);
        setAlerts([...loadedAlerts, ...outcome.newAlerts]);
        setRelationships(loadedRelationships);
        setChat(loadedChat);
        setAvatars(avatarMap);
        setRememberedEmail(settings.rememberedEmail);
        setCurrentUserId(
          settings.sessionUserId && loadedUsers.some((user) => user.id === settings.sessionUserId)
            ? settings.sessionUserId
            : null,
        );
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'CareAI could not open its local database in this browser.',
        );
        setReady(true);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------- selectors */

  const elderFor = useCallback(
    (elderId: string): Elder | null => {
      const user = users.find((item) => item.id === elderId);
      return user && user.role === 'elder' ? (user as Elder) : null;
    },
    [users],
  );

  const caretakerForElder = useCallback(
    (elderId: string): Caretaker | null => {
      const relationship = relationships.find((item) => item.elderId === elderId);
      if (!relationship) return null;
      const user = users.find((item) => item.id === relationship.caretakerId);
      return user && user.role === 'caretaker' ? (user as Caretaker) : null;
    },
    [relationships, users],
  );

  const eldersForCaretaker = useCallback(
    (caretakerId: string): Elder[] =>
      relationships
        .filter((relationship) => relationship.caretakerId === caretakerId)
        .map((relationship) => elderFor(relationship.elderId))
        .filter((elder): elder is Elder => elder !== null),
    [relationships, elderFor],
  );

  const medicinesFor = useCallback(
    (elderId: string) => medicinesForElder(medicines, elderId),
    [medicines],
  );

  const summariesForCaretaker = useCallback(
    (caretakerId: string): ElderSummary[] =>
      eldersForCaretaker(caretakerId).map((elder) => summarizeElder(elder, medicines, alerts)),
    [eldersForCaretaker, medicines, alerts],
  );

  /* ---------------------------------------------------------------- auth */

  const login = useCallback(
    async (email: string, password: string, role: UserRole, remember: boolean): Promise<Result> => {
      const normalized = normalizeEmail(email);
      const user = users.find((item) => normalizeEmail(item.email) === normalized);
      if (!user) return { ok: false, error: 'No account uses that email address.' };
      if (user.role !== role) {
        return {
          ok: false,
          error: `That account is registered as a ${user.role}. Choose ${user.role} above and sign in again.`,
        };
      }
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return { ok: false, error: 'That password does not match this account.' };

      await settingsRepository.write({
        sessionUserId: user.id,
        rememberedEmail: remember ? user.email : null,
      });
      setRememberedEmail(remember ? user.email : null);
      setCurrentUserId(user.id);
      return { ok: true, data: undefined };
    },
    [users],
  );

  const logout = useCallback(async () => {
    await settingsRepository.write({ sessionUserId: null });
    setCurrentUserId(null);
  }, []);

  const signup = useCallback(
    async (input: SignupInput): Promise<Result<User>> => {
      const email = normalizeEmail(input.email);
      const username = normalizeUsername(input.username);
      const phone = normalizePhone(input.phone);

      if (users.some((user) => normalizeEmail(user.email) === email)) {
        return { ok: false, error: 'An account already uses that email address.' };
      }
      if (users.some((user) => normalizeUsername(user.username) === username)) {
        return { ok: false, error: 'That username is taken. Choose another one.' };
      }
      if (users.some((user) => normalizePhone(user.phone) === phone)) {
        return { ok: false, error: 'An account already uses that phone number.' };
      }

      let targetCaretaker: Caretaker | null = null;
      if (input.role === 'elder' && input.caretakerCode.trim()) {
        const code = formatCaretakerCode(input.caretakerCode);
        if (!isCaretakerCodeShaped(code)) {
          return { ok: false, error: 'Caretaker codes look like CARE-7F29K4. Check the code and try again.' };
        }
        const found = users.find((user) => user.role === 'caretaker' && user.caretakerCode === code);
        if (!found) return { ok: false, error: 'No caretaker uses that code.' };
        const count = relationships.filter((item) => item.caretakerId === found.id).length;
        if (count >= MAX_ELDERS_PER_CARETAKER) {
          return {
            ok: false,
            error: `This caretaker is currently supervising the maximum of ${MAX_ELDERS_PER_CARETAKER} elders.`,
          };
        }
        targetCaretaker = found as Caretaker;
      }

      const userId = createId('user');
      let avatarId: string | null = null;
      if (input.avatarDataUrl) {
        avatarId = createId('avatar');
        await avatarRepository.save({ id: avatarId, dataUrl: input.avatarDataUrl });
        setAvatars((current) => ({ ...current, [avatarId as string]: input.avatarDataUrl as string }));
      }

      const caretakerCode =
        input.role === 'caretaker'
          ? generateCaretakerCode(
              users.map((user) => user.caretakerCode).filter((code): code is string => Boolean(code)),
            )
          : null;

      const user: User = {
        id: userId,
        fullName: input.fullName.trim(),
        username: input.username.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        passwordHash: await hashPassword(input.password),
        role: input.role,
        avatarId,
        emergencyContactName: input.emergencyContactName.trim(),
        emergencyContactPhone: input.emergencyContactPhone.trim(),
        caretakerCode,
        age: input.age,
        createdAt: new Date().toISOString(),
      };

      await userRepository.save(user);
      setUsers((current) => [...current, user]);

      if (targetCaretaker) {
        const relationship: Relationship = {
          id: createId('rel'),
          elderId: user.id,
          caretakerId: targetCaretaker.id,
          createdAt: new Date().toISOString(),
        };
        await relationshipRepository.save(relationship);
        setRelationships((current) => [...current, relationship]);
      }

      await settingsRepository.write({ sessionUserId: user.id });
      setCurrentUserId(user.id);
      return { ok: true, data: user };
    },
    [users, relationships],
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<Result<string>> => {
      const normalized = normalizeEmail(email);
      const user = users.find((item) => normalizeEmail(item.email) === normalized);
      if (!user) return { ok: false, error: 'No account uses that email address.' };
      const code = randomToken(6, '0123456789');
      pendingResets.current.set(normalized, {
        userId: user.id,
        code,
        expiresAt: Date.now() + RESET_CODE_TTL_MS,
      });
      return { ok: true, data: code };
    },
    [users],
  );

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string): Promise<Result> => {
      const normalized = normalizeEmail(email);
      const pending = pendingResets.current.get(normalized);
      if (!pending) return { ok: false, error: 'Start again — this reset request is no longer active.' };
      if (Date.now() > pending.expiresAt) {
        pendingResets.current.delete(normalized);
        return { ok: false, error: 'That reset code has expired. Request a new one.' };
      }
      if (pending.code !== code.trim()) return { ok: false, error: 'That reset code is not correct.' };

      const user = users.find((item) => item.id === pending.userId);
      if (!user) return { ok: false, error: 'That account no longer exists.' };

      const updated: User = { ...user, passwordHash: await hashPassword(newPassword) };
      await userRepository.save(updated);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      pendingResets.current.delete(normalized);
      return { ok: true, data: undefined };
    },
    [users],
  );

  const updateProfile = useCallback(
    async (
      patch: Partial<Pick<User, 'fullName' | 'username' | 'email' | 'phone' | 'emergencyContactName' | 'emergencyContactPhone' | 'age'>>,
      avatar?: { dataUrl: string | null },
    ): Promise<Result> => {
      if (!currentUser) return { ok: false, error: 'Sign in first.' };

      if (patch.email !== undefined) {
        const email = normalizeEmail(patch.email);
        if (users.some((user) => user.id !== currentUser.id && normalizeEmail(user.email) === email)) {
          return { ok: false, error: 'An account already uses that email address.' };
        }
      }
      if (patch.username !== undefined) {
        const username = normalizeUsername(patch.username);
        if (users.some((user) => user.id !== currentUser.id && normalizeUsername(user.username) === username)) {
          return { ok: false, error: 'That username is taken. Choose another one.' };
        }
      }
      if (patch.phone !== undefined) {
        const phone = normalizePhone(patch.phone);
        if (users.some((user) => user.id !== currentUser.id && normalizePhone(user.phone) === phone)) {
          return { ok: false, error: 'An account already uses that phone number.' };
        }
      }

      let avatarId = currentUser.avatarId;
      if (avatar) {
        if (avatar.dataUrl === null) {
          if (avatarId) {
            const removedId = avatarId;
            await avatarRepository.remove(removedId);
            setAvatars((current) => {
              const next = { ...current };
              delete next[removedId];
              return next;
            });
          }
          avatarId = null;
        } else {
          const nextId = avatarId ?? createId('avatar');
          await avatarRepository.save({ id: nextId, dataUrl: avatar.dataUrl });
          setAvatars((current) => ({ ...current, [nextId]: avatar.dataUrl as string }));
          avatarId = nextId;
        }
      }

      const updated: User = { ...currentUser, ...patch, avatarId };
      await userRepository.save(updated);
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      return { ok: true, data: undefined };
    },
    [currentUser, users],
  );

  /* -------------------------------------------------------- connections */

  const connectElderToCaretaker = useCallback(
    async (code: string): Promise<Result<Caretaker>> => {
      if (!currentUser || currentUser.role !== 'elder') {
        return { ok: false, error: 'Only an elder account can connect to a caretaker.' };
      }
      if (relationships.some((item) => item.elderId === currentUser.id)) {
        return { ok: false, error: 'You are already connected to a caretaker.' };
      }
      const formatted = formatCaretakerCode(code);
      if (!isCaretakerCodeShaped(formatted)) {
        return { ok: false, error: 'Caretaker codes look like CARE-7F29K4. Check the code and try again.' };
      }
      const caretaker = users.find((user) => user.role === 'caretaker' && user.caretakerCode === formatted);
      if (!caretaker) return { ok: false, error: 'No caretaker uses that code.' };

      const count = relationships.filter((item) => item.caretakerId === caretaker.id).length;
      if (count >= MAX_ELDERS_PER_CARETAKER) {
        return {
          ok: false,
          error: `This caretaker is currently supervising the maximum of ${MAX_ELDERS_PER_CARETAKER} elders.`,
        };
      }

      // Ensure clean state before writing the new relationship
      await relationshipRepository.disconnectElderFromCaretaker(currentUser.id);

      const relationship: Relationship = {
        id: createId('rel'),
        elderId: currentUser.id,
        caretakerId: caretaker.id,
        createdAt: new Date().toISOString(),
      };
      await relationshipRepository.save(relationship);
      setRelationships((current) => [
        ...current.filter((item) => item.elderId !== currentUser.id),
        relationship,
      ]);
      return { ok: true, data: caretaker as Caretaker };
    },
    [currentUser, relationships, users],
  );

  const disconnectCaretaker = useCallback(async (): Promise<Result> => {
    if (!currentUser || currentUser.role !== 'elder') {
      return { ok: false, error: 'Only an elder account can disconnect a caretaker.' };
    }
    const hasConnection = relationships.some((item) => item.elderId === currentUser.id);
    if (!hasConnection) return { ok: false, error: 'You are not connected to a caretaker.' };

    // Remove all relationships belonging to this elder from IndexedDB
    await relationshipRepository.disconnectElderFromCaretaker(currentUser.id);

    // Update React state immediately
    setRelationships((current) => current.filter((item) => item.elderId !== currentUser.id));
    return { ok: true, data: undefined };
  }, [currentUser, relationships]);

  const regenerateCaretakerCode = useCallback(async (): Promise<Result<string>> => {
    if (!currentUser || currentUser.role !== 'caretaker') {
      return { ok: false, error: 'Only a caretaker account has a connection code.' };
    }
    if (relationships.some((item) => item.caretakerId === currentUser.id)) {
      return {
        ok: false,
        error: 'Disconnect your elders before creating a new code, so nobody loses their link to you.',
      };
    }
    const code = generateCaretakerCode(
      users.map((user) => user.caretakerCode).filter((value): value is string => Boolean(value)),
    );
    const updated: User = { ...currentUser, caretakerCode: code };
    await userRepository.save(updated);
    setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
    return { ok: true, data: code };
  }, [currentUser, relationships, users]);

  /* ----------------------------------------------------------- medicines */

  const addMedicine = useCallback(async (input: MedicineInput): Promise<Result<Medicine>> => {
    const medicine: Medicine = {
      id: createId('med'),
      elderId: input.elderId,
      name: input.name.trim(),
      dose: input.dose.trim(),
      time: input.time,
      status: 'scheduled',
      frequency: input.frequency,
      notes: input.notes.trim(),
      statusDate: todayKey(),
      createdAt: new Date().toISOString(),
    };
    await medicineRepository.save(medicine);
    setMedicines((current) => [...current, medicine]);
    return { ok: true, data: medicine };
  }, []);

  const updateMedicine = useCallback(
    async (id: string, patch: Partial<MedicineInput> & { status?: MedicineStatus }): Promise<Result> => {
      const existing = medicines.find((medicine) => medicine.id === id);
      if (!existing) return { ok: false, error: 'That medicine no longer exists.' };
      const updated: Medicine = {
        ...existing,
        ...patch,
        name: (patch.name ?? existing.name).trim(),
        dose: (patch.dose ?? existing.dose).trim(),
        notes: (patch.notes ?? existing.notes).trim(),
        statusDate: todayKey(),
      };
      await medicineRepository.save(updated);
      setMedicines((current) => current.map((medicine) => (medicine.id === id ? updated : medicine)));
      return { ok: true, data: undefined };
    },
    [medicines],
  );

  const deleteMedicine = useCallback(async (id: string): Promise<Result> => {
    await medicineRepository.remove(id);
    setMedicines((current) => current.filter((medicine) => medicine.id !== id));
    return { ok: true, data: undefined };
  }, []);

  const markMedicineStatus = useCallback(
    async (id: string, status: MedicineStatus): Promise<Result> => {
      const existing = medicines.find((medicine) => medicine.id === id);
      if (!existing) return { ok: false, error: 'That medicine no longer exists.' };

      const updated: Medicine = { ...existing, status, statusDate: todayKey() };
      const log = createLog(updated, status);
      const elder = users.find((user) => user.id === updated.elderId);

      await medicineRepository.save(updated);
      await reminderRepository.save(log);

      setMedicines((current) => current.map((medicine) => (medicine.id === id ? updated : medicine)));
      setLogs((current) => [...current, log]);

      if (status === 'not_taken') {
        const alert = createNotTakenAlert(updated, elder ? elder.fullName : 'Elder');
        await alertRepository.save(alert);
        setAlerts((current) => [...current, alert]);
      }

      if (status === 'taken') {
        const stale = alerts.filter(
          (alert) => alert.medicineId === updated.id && !alert.acknowledged,
        );
        if (stale.length) {
          const acknowledged = stale.map((alert) => ({ ...alert, acknowledged: true }));
          await alertRepository.saveMany(acknowledged);
          setAlerts((current) =>
            current.map((alert) => {
              const match = acknowledged.find((item) => item.id === alert.id);
              return match ?? alert;
            }),
          );
        }
      }

      return { ok: true, data: undefined };
    },
    [medicines, users, alerts],
  );

  const acknowledgeAlert = useCallback(
    async (id: string): Promise<Result> => {
      const alert = alerts.find((item) => item.id === id);
      if (!alert) return { ok: false, error: 'That alert no longer exists.' };
      const updated: Alert = { ...alert, acknowledged: true };
      await alertRepository.save(updated);
      setAlerts((current) => current.map((item) => (item.id === id ? updated : item)));
      return { ok: true, data: undefined };
    },
    [alerts],
  );

  /* ---------------------------------------------------------------- chat */

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!currentUser) return;
      const now = new Date();
      const question: ChatMessage = {
        id: createId('msg'),
        userId: currentUser.id,
        sender: 'user',
        text: text.trim(),
        timestamp: now.toISOString(),
      };

      const scopeElderId =
        currentUser.role === 'elder'
          ? currentUser.id
          : (relationships.find((item) => item.caretakerId === currentUser.id)?.elderId ?? null);

      const scopedMedicines = scopeElderId ? medicinesForElder(medicines, scopeElderId) : [];
      const caretaker = currentUser.role === 'elder' ? caretakerForElder(currentUser.id) : null;

      const replyText = answerCareAI(question.text, {
        user: currentUser,
        medicines: scopedMedicines,
        alerts: alerts.filter((alert) => !scopeElderId || alert.elderId === scopeElderId),
        caretakerName: caretaker ? caretaker.fullName : null,
        caretakerPhone: caretaker ? caretaker.phone : null,
        now,
      });

      const reply: ChatMessage = {
        id: createId('msg'),
        userId: currentUser.id,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      await chatRepository.save(question);
      await chatRepository.save(reply);
      setChat((current) => [...current, question, reply]);
    },
    [currentUser, relationships, medicines, alerts, caretakerForElder],
  );

  /* --------------------------------------------------------- expiry loop */

  const runExpiryCheck = useCallback(async () => {
    const outcome = applyExpiries(medicines, users);
    if (!outcome.changed) return;
    await medicineRepository.saveMany(outcome.medicines);
    if (outcome.newLogs.length) await reminderRepository.saveMany(outcome.newLogs);
    if (outcome.newAlerts.length) await alertRepository.saveMany(outcome.newAlerts);
    setMedicines(outcome.medicines);
    if (outcome.newLogs.length) setLogs((current) => [...current, ...outcome.newLogs]);
    if (outcome.newAlerts.length) setAlerts((current) => [...current, ...outcome.newAlerts]);
  }, [medicines, users]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      loadError,
      currentUser,
      currentRole: currentUser ? currentUser.role : null,
      rememberedEmail,
      users,
      medicines,
      logs,
      alerts,
      relationships,
      avatars,
      chat: currentUser ? chat.filter((message) => message.userId === currentUser.id) : [],
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      connectElderToCaretaker,
      disconnectCaretaker,
      regenerateCaretakerCode,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      markMedicineStatus,
      acknowledgeAlert,
      sendChatMessage,
      runExpiryCheck,
      elderFor,
      caretakerForElder,
      eldersForCaretaker,
      summariesForCaretaker,
      medicinesFor,
    }),
    [
      ready,
      loadError,
      currentUser,
      rememberedEmail,
      users,
      medicines,
      logs,
      alerts,
      relationships,
      avatars,
      chat,
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      connectElderToCaretaker,
      disconnectCaretaker,
      regenerateCaretakerCode,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      markMedicineStatus,
      acknowledgeAlert,
      sendChatMessage,
      runExpiryCheck,
      elderFor,
      caretakerForElder,
      eldersForCaretaker,
      summariesForCaretaker,
      medicinesFor,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}