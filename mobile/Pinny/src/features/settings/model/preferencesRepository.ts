import { eq } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { preferences } from '@/db/schema';

// Chaves conhecidas: nada de string solta pelo app.
export type PreferenceKey = 'shakeHintSeen';

export interface PreferencesRepository {
  getFlag(key: PreferenceKey): Promise<boolean>;
  setFlag(key: PreferenceKey, value: boolean): Promise<void>;
}

const TRUE = 'true';
const FALSE = 'false';

export function createPreferencesRepository(database: Database = db): PreferencesRepository {
  return {
    async getFlag(key) {
      const row = database.select().from(preferences).where(eq(preferences.key, key)).get();
      return row?.value === TRUE;
    },

    async setFlag(key, value) {
      const stored = value ? TRUE : FALSE;
      database
        .insert(preferences)
        .values({ key, value: stored })
        .onConflictDoUpdate({ target: preferences.key, set: { value: stored } })
        .run();
    },
  };
}

export const preferencesRepository = createPreferencesRepository();
