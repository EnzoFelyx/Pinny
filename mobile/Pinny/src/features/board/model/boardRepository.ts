import { and, asc, count, eq, isNotNull, ne } from 'drizzle-orm';

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
  getById(id: string): Promise<Board | null>;
  create(folderId: string, title: string): Promise<Board>;
  rename(id: string, title: string): Promise<void>;
  // Pode trocar de pasta: folderId é a pasta de destino.
  move(id: string, folderId: string, placement: Placement): Promise<void>;
  // Volta à pasta e à posição exatas de antes (desfazer o "Mover para outra pasta").
  moveToPosition(id: string, folderId: string, position: number): Promise<void>;
  remove(id: string): Promise<void>;
  // Recria o quadro exatamente como era (desfazer a exclusão).
  restore(board: Board): Promise<void>;
  // Fixa na Início (pinnedAt = agora) ou desafixa (null).
  setPinnedAt(id: string, pinnedAt: string | null): Promise<void>;
  countPinnedInFolder(folderId: string): Promise<number>;
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

    async getById(id) {
      const row = database.select().from(boards).where(eq(boards.id, id)).get();
      return row ? parseRow(boardSchema, row, 'boards') : null;
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

    async moveToPosition(id, folderId, position) {
      database
        .update(boards)
        .set({ folderId, position, updatedAt: nowIso() })
        .where(eq(boards.id, id))
        .run();
    },

    async setPinnedAt(id, pinnedAt) {
      database.update(boards).set({ pinnedAt, updatedAt: nowIso() }).where(eq(boards.id, id)).run();
    },

    async countPinnedInFolder(folderId) {
      const row = database
        .select({ total: count() })
        .from(boards)
        .where(and(eq(boards.folderId, folderId), isNotNull(boards.pinnedAt)))
        .get();
      return row?.total ?? 0;
    },

    async remove(id) {
      database.delete(boards).where(eq(boards.id, id)).run();
    },

    async restore(board) {
      database.insert(boards).values(board).run();
    },
  };
}

export const boardRepository = createBoardRepository();
