import { and, asc, eq, ne } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { applyPlacement } from '@/db/ordering';
import { columns } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type Column, columnSchema } from './board.schema';

export interface ColumnRepository {
  listByBoard(boardId: string): Promise<Column[]>;
  // Novas colunas entram no fim do quadro ("+ Adicionar coluna").
  create(boardId: string, title: string): Promise<Column>;
  rename(id: string, title: string): Promise<void>;
  move(id: string, placement: Placement): Promise<void>;
  // Apaga a coluna e os cartões dela (cascata).
  remove(id: string): Promise<void>;
}

export function createColumnRepository(database: Database = db): ColumnRepository {
  const siblingsOf = (boardId: string, excludeId?: string) =>
    database
      .select({ id: columns.id, position: columns.position })
      .from(columns)
      .where(
        excludeId
          ? and(eq(columns.boardId, boardId), ne(columns.id, excludeId))
          : eq(columns.boardId, boardId),
      )
      .orderBy(asc(columns.position))
      .all();

  return {
    async listByBoard(boardId) {
      const rows = database
        .select()
        .from(columns)
        .where(eq(columns.boardId, boardId))
        .orderBy(asc(columns.position))
        .all();
      return parseRows(columnSchema, rows, 'columns');
    },

    async create(boardId, title) {
      const now = nowIso();
      const row = database
        .insert(columns)
        .values({
          id: createId(),
          boardId,
          title,
          position: positionAtEnd(siblingsOf(boardId)),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      return parseRow(columnSchema, row, 'columns');
    },

    async rename(id, title) {
      database.update(columns).set({ title, updatedAt: nowIso() }).where(eq(columns.id, id)).run();
    },

    async move(id, placement) {
      database.transaction((tx) => {
        const column = tx
          .select({ boardId: columns.boardId })
          .from(columns)
          .where(eq(columns.id, id))
          .get();
        if (!column) throw new Error(`Coluna "${id}" não encontrada.`);

        const position = applyPlacement(
          siblingsOf(column.boardId, id),
          placement,
          (itemId, itemPosition) =>
            tx.update(columns).set({ position: itemPosition }).where(eq(columns.id, itemId)).run(),
        );
        tx.update(columns).set({ position, updatedAt: nowIso() }).where(eq(columns.id, id)).run();
      });
    },

    async remove(id) {
      database.delete(columns).where(eq(columns.id, id)).run();
    },
  };
}

export const columnRepository = createColumnRepository();
