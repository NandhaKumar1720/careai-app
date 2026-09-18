import type { Medicine } from '../../types';
import { STORES, getAll, getOne, putMany, putOne, removeOne } from './database';

export const medicineRepository = {
  list: () => getAll<Medicine>(STORES.medicines),
  get: (id: string) => getOne<Medicine>(STORES.medicines, id),
  save: (medicine: Medicine) => putOne<Medicine>(STORES.medicines, medicine),
  saveMany: (medicines: Medicine[]) => putMany<Medicine>(STORES.medicines, medicines),
  remove: (id: string) => removeOne(STORES.medicines, id),
};
