import { asc, count, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { folders } from '@/db/schema';
import type { LabelColor } from '@/features/card/model/card.types';
import { applyPlacement } from '@/db/ordering';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type Folder, type FolderIcon, folderSchema } from './folder.schema';

export interface NewFolderInput {
  title: string;
  icon?: FolderIcon;
  color?: LabelColor;
}

export interface FolderRepository {
  // Fixadas primeiro (da fixada mais recente para a mais antiga), depois as outras pela posição.
  list(): Promise<Folder[]>;
  getById(id: string): Promise<Folder | null>;
  create(input: NewFolderInput): Promise<Folder>;
  rename(id: string, title: string): Promise<void>;
  move(id: string, placement: Placement): Promise<void>;
  // Fixa no topo da Início (pinnedAt = agora) ou desafixa (null).
  setPinnedAt(id: string, pinnedAt: string | null): Promise<void>;
  countPinned(): Promise<number>;
  // Apaga a pasta e, em cascata, tudo o que está dentro dela.
  remove(id: string): Promise<void>;
}

export function createFolderRepository(database: Database = db): FolderRepository {
  return {
    async list() {
      const rows = database
        .select()
        .from(folders)
        .orderBy(sql`${folders.pinnedAt} IS NULL`, desc(folders.pinnedAt), asc(folders.position))
        .all();
      return parseRows(folderSchema, rows, 'folders');
    },

    async getById(id) {
      const row = database.select().from(folders).where(eq(folders.id, id)).get();
      return row ? parseRow(folderSchema, row, 'folders') : null;
    },

    async create({ title, icon = 'folder', color = 'lavender' }) {
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
          icon,
          color,
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

    async setPinnedAt(id, pinnedAt) {
      database
        .update(folders)
        .set({ pinnedAt, updatedAt: nowIso() })
        .where(eq(folders.id, id))
        .run();
    },

    async countPinned() {
      const row = database
        .select({ total: count() })
        .from(folders)
        .where(isNotNull(folders.pinnedAt))
        .get();
      return row?.total ?? 0;
    },

    async remove(id) {
      database.delete(folders).where(eq(folders.id, id)).run();
    },
  };
}

export const folderRepository = createFolderRepository();
