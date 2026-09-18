import type { Relationship } from '../../types';
import { STORES, getAll, putMany, putOne, removeOne } from './database';

export const relationshipRepository = {
  list: () => getAll<Relationship>(STORES.relationships),
  save: (relationship: Relationship) => putOne<Relationship>(STORES.relationships, relationship),
  saveMany: (relationships: Relationship[]) => putMany<Relationship>(STORES.relationships, relationships),
  remove: (id: string) => removeOne(STORES.relationships, id),
};
