import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

import type { Database } from '@/db/client';
import * as schema from '@/db/schema';

const MIGRATIONS_FOLDER = path.join(__dirname, '..', 'db', 'migrations');

// Banco SQLite de verdade, em memória, com as mesmas migrações do app: os repositórios são
// testados com SQL real, sem mock do banco. Cada chamada devolve um banco novo e vazio.
export function createTestDatabase(): Database {
  const sqlite = new BetterSqlite3(':memory:');
  // Igual ao app (src/db/client.ts): sem isso, apagar não propaga em cascata.
  sqlite.pragma('foreign_keys = ON');
  const database = drizzle(sqlite, { schema });
  migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
  // O app usa o driver do expo-sqlite e os testes o better-sqlite3. Os dois são bancos síncronos
  // do Drizzle com a mesma API de consulta; só o tipo do resultado de `run` é diferente, e os
  // repositórios não o leem. Por isso a troca de tipo aqui, num lugar só.
  return database as unknown as Database;
}
