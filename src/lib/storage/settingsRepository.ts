import type { AppSettings } from '../../types';
import { STORES, getOne, putOne } from './database';

export const SETTINGS_ID = 'app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  seeded: false,
  sessionUserId: null,
  rememberedEmail: null,
};

export const settingsRepository = {
  async read(): Promise<AppSettings> {
    const stored = await getOne<AppSettings>(STORES.settings, SETTINGS_ID);
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
  },
  async write(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await settingsRepository.read();
    const next: AppSettings = { ...current, ...patch, id: SETTINGS_ID };
    await putOne<AppSettings>(STORES.settings, next);
    return next;
  },
};
