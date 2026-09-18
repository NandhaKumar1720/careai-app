import type { ChatMessage } from '../../types';
import { STORES, getAll, putOne } from './database';

export const chatRepository = {
  list: () => getAll<ChatMessage>(STORES.chat),
  save: (message: ChatMessage) => putOne<ChatMessage>(STORES.chat, message),
};
