import type { Alert } from '../../types';
import { STORES, getAll, putMany, putOne, removeOne } from './database';

export const alertRepository = {
  list: () => getAll<Alert>(STORES.alerts),
  save: (alert: Alert) => putOne<Alert>(STORES.alerts, alert),
  saveMany: (alerts: Alert[]) => putMany<Alert>(STORES.alerts, alerts),
  remove: (id: string) => removeOne(STORES.alerts, id),
};
