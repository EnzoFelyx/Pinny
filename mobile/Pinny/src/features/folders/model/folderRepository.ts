import { asc, eq, ne } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { folders } from '@/db/schema';
import { applyPlacement } from '@/db/ordering';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type Folder, folderSchema } from './folder.schema';

export interface FolderRepository {
  list(): Promise<Folder[]>;
  create(title: string): Promise<Folder>;
  rename(id: string, title: string): Promise<void>;
  move(id: string, placement: Placement): Promise<void>;
  // Apaga a pasta e, em cascata, tudo o que está dentro dela.
  remove(id: string): Promise<void>;
}

export function createFolderRepository(database: Database = db): FolderRepository {
  return {
    async list() {
      const rows = database.select().from(folders).orderBy(asc(folders.position)).all();
      return parseRows(folderSchema, rows, 'folders');
    },

    async create(title) {
      const siblings = database
        .select({ id: folders.id, position: folders.position })
        .from(folders)
        .orderBy(asc(folders.position))
        .all();
      const now = nowIso();
      const row = database
        .insert(folders)
        .values({
          id: createId(),
          title,
          position: positionAtEnd(siblings),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      return parseRow(folderSchema, row, 'folders');
    },

    async rename(id, title) {
      database.update(folders).set({ title, updatedAt: nowIso() }).where(eq(folders.id, id)).run();
    },

    async move(id, placement) {
      database.transaction((tx) => {
        const siblings = tx
          .select({ id: folders.id, position: folders.position })
          .from(folders)
          .where(ne(folders.id, id))
          .orderBy(asc(folders.position))
          .all();
        const position = applyPlacement(siblings, placement, (itemId, itemPosition) =>
          tx.update(folders).set({ position: itemPosition }).where(eq(folders.id, itemId)).run(),
        );
        tx.update(folders).set({ position, updatedAt: nowIso() }).where(eq(folders.id, id)).run();
      });
    },

    async remove(id) {
      database.delete(folders).where(eq(folders.id, id)).run();
    },
  };
}

export const folderRepository = createFolderRepository();
