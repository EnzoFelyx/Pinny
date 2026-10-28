import { and, asc, eq, ne } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { applyPlacement } from '@/db/ordering';
import { boards } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type Board, boardSchema } from './board.schema';

export interface BoardRepository {
  listByFolder(folderId: string): Promise<Board[]>;
  create(folderId: string, title: string): Promise<Board>;
  rename(id: string, title: string): Promise<void>;
  // Pode trocar de pasta: folderId é a pasta de destino.
  move(id: string, folderId: string, placement: Placement): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createBoardRepository(database: Database = db): BoardRepository {
  const siblingsOf = (folderId: string, excludeId?: string) =>
    database
      .select({ id: boards.id, position: boards.position })
      .from(boards)
      .where(
        excludeId
          ? and(eq(boards.folderId, folderId), ne(boards.id, excludeId))
          : eq(boards.folderId, folderId),
      )
      .orderBy(asc(boards.position))
      .all();

  return {
    async listByFolder(folderId) {
      const rows = database
        .select()
        .from(boards)
        .where(eq(boards.folderId, folderId))
        .orderBy(asc(boards.position))
        .all();
      return parseRows(boardSchema, rows, 'boards');
    },

    async create(folderId, title) {
      const now = nowIso();
      const row = database
        .insert(boards)
        .values({
          id: createId(),
          folderId,
          title,
          position: positionAtEnd(siblingsOf(folderId)),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      return parseRow(boardSchema, row, 'boards');
    },

    async rename(id, title) {
      database.update(boards).set({ title, updatedAt: nowIso() }).where(eq(boards.id, id)).run();
    },

    async move(id, folderId, placement) {
      database.transaction((tx) => {
        const position = applyPlacement(
          siblingsOf(folderId, id),
          placement,
          (itemId, itemPosition) =>
            tx.update(boards).set({ position: itemPosition }).where(eq(boards.id, itemId)).run(),
        );
        tx.update(boards)
          .set({ folderId, position, updatedAt: nowIso() })
          .where(eq(boards.id, id))
          .run();
      });
    },

    async remove(id) {
      database.delete(boards).where(eq(boards.id, id)).run();
    },
  };
}

export const boardRepository = createBoardRepository();
