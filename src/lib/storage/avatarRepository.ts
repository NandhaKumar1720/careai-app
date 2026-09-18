import type { AvatarRecord } from '../../types';
import { STORES, getAll, putMany, putOne, removeOne } from './database';

export const avatarRepository = {
  list: () => getAll<AvatarRecord>(STORES.avatars),
  save: (avatar: AvatarRecord) => putOne<AvatarRecord>(STORES.avatars, avatar),
  saveMany: (avatars: AvatarRecord[]) => putMany<AvatarRecord>(STORES.avatars, avatars),
  remove: (id: string) => removeOne(STORES.avatars, id),
};
