import type { ReminderLog } from '../../types';
import { STORES, getAll, putMany, putOne } from './database';

export const reminderRepository = {
  list: () => getAll<ReminderLog>(STORES.logs),
  save: (log: ReminderLog) => putOne<ReminderLog>(STORES.logs, log),
  saveMany: (logs: ReminderLog[]) => putMany<ReminderLog>(STORES.logs, logs),
};
