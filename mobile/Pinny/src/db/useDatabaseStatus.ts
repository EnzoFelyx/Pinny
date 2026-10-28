import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect } from 'react';

import { db } from './client';
import migrations from './migrations/migrations';

export type DatabaseStatus = 'loading' | 'ready' | 'error';

// Aplica as migrações pendentes ao abrir o app.
export function useDatabaseStatus(): DatabaseStatus {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) console.error('Falha ao preparar o banco local.', error);
  }, [error]);

  if (error) return 'error';
  return success ? 'ready' : 'loading';
}
