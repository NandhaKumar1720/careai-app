import type { User } from '../../types';
import { STORES, getAll, getOne, putMany, putOne, removeOne } from './database';

export const userRepository = {
  list: () => getAll<User>(STORES.users),
  get: (id: string) => getOne<User>(STORES.users, id),
  save: (user: User) => putOne<User>(STORES.users, user),
  saveMany: (users: User[]) => putMany<User>(STORES.users, users),
  remove: (id: string) => removeOne(STORES.users, id),
};
