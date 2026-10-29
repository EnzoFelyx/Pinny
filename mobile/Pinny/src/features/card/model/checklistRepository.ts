import { and, asc, count, eq, inArray, ne, sql } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { applyPlacement } from '@/db/ordering';
import { checklistItems } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type ChecklistItem, checklistItemSchema } from './card.schema';

export interface ChecklistProgress {
  done: number;
  total: number;
}

export interface ChecklistRepository {
  listByCard(cardId: string): Promise<ChecklistItem[]>;
  // Progresso de vários cartões numa consulta só (tela do quadro). Cartão sem checklist não aparece.
  progressByCards(cardIds: readonly string[]): Promise<Record<string, ChecklistProgress>>;
  add(cardId: string, text: string): Promise<ChecklistItem>;
  rename(id: string, text: string): Promise<void>;
  setDone(id: string, isDone: boolean): Promise<void>;
  // Usado pela automação "Ao mover para Concluído, marcar todo o checklist" (etapa 11).
  setAllDone(cardId: string, isDone: boolean): Promise<void>;
  move(id: string, placement: Placement): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createChecklistRepository(database: Database = db): ChecklistRepository {
  const siblingsOf = (cardId: string, excludeId?: string) =>
    database
      .select({ id: checklistItems.id, position: checklistItems.position })
      .from(checklistItems)
      .where(
        excludeId
          ? and(eq(checklistItems.cardId, cardId), ne(checklistItems.id, excludeId))
          : eq(checklistItems.cardId, cardId),
      )
      .orderBy(asc(checklistItems.position))
      .all();

  const updateItem = (id: string, values: Partial<Pick<ChecklistItem, 'text' | 'isDone'>>) =>
    database
      .update(checklistItems)
      .set({ ...values, updatedAt: nowIso() })
      .where(eq(checklistItems.id, id))
      .run();

  return {
    async listByCard(cardId) {
      const rows = database
        .select()
        .from(checklistItems)
        .where(eq(checklistItems.cardId, cardId))
        .orderBy(asc(checklistItems.position))
        .all();
      return parseRows(checklistItemSchema, rows, 'checklist_items');
    },

    async progressByCards(cardIds) {
      if (cardIds.length === 0) return {};
      const rows = database
        .select({
          cardId: checklistItems.cardId,
          total: count(),
          done: sql<number>`sum(${checklistItems.isDone})`,
        })
        .from(checklistItems)
        .where(inArray(checklistItems.cardId, [...cardIds]))
        .groupBy(checklistItems.cardId)
        .all();
      return Object.fromEntries(
        rows.map((row) => [row.cardId, { done: Number(row.done ?? 0), total: row.total }]),
      );
    },

    async add(cardId, text) {
      const now = nowIso();
      const row = database
        .insert(checklistItems)
        .values({
          id: createId(),
          cardId,
          text,
          isDone: false,
          position: positionAtEnd(siblingsOf(cardId)),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      return parseRow(checklistItemSchema, row, 'checklist_items');
    },

    async rename(id, text) {
      updateItem(id, { text });
    },

    async setDone(id, isDone) {
      updateItem(id, { isDone });
    },

    async setAllDone(cardId, isDone) {
      database
        .update(checklistItems)
        .set({ isDone, updatedAt: nowIso() })
        .where(eq(checklistItems.cardId, cardId))
        .run();
    },

    async move(id, placement) {
      database.transaction((tx) => {
        const item = tx
          .select({ cardId: checklistItems.cardId })
          .from(checklistItems)
          .where(eq(checklistItems.id, id))
          .get();
        if (!item) throw new Error(`Subtarefa "${id}" não encontrada.`);

        const position = applyPlacement(
          siblingsOf(item.cardId, id),
          placement,
          (itemId, itemPosition) =>
            tx
              .update(checklistItems)
              .set({ position: itemPosition })
              .where(eq(checklistItems.id, itemId))
              .run(),
        );
        tx.update(checklistItems)
          .set({ position, updatedAt: nowIso() })
          .where(eq(checklistItems.id, id))
          .run();
      });
    },

    async remove(id) {
      database.delete(checklistItems).where(eq(checklistItems.id, id)).run();
    },
  };
}

export const checklistRepository = createChecklistRepository();
