import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'pinny.db';

// enableChangeListener permite que telas reajam a mudanças no banco (consultas "ao vivo").
const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// O SQLite vem com chaves estrangeiras desligadas; sem isso, apagar não propaga em cascata.
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
