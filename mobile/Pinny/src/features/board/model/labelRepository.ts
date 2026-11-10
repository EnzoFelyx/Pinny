import { asc, eq, inArray } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { cardLabels, labels } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import type { LabelColor } from '@/features/card/model/card.types';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/time';

import { type Label, labelSchema } from './board.schema';

export interface LabelInput {
  name: string;
  color: LabelColor;
}

// Etiquetas pertencem ao quadro e podem ser ligadas a vários cartões dele.
export interface LabelRepository {
  listByBoard(boardId: string): Promise<Label[]>;
  listByCard(cardId: string): Promise<Label[]>;
  // Etiquetas de vários cartões numa consulta só (tela do quadro), agrupadas por cartão.
  listByCards(cardIds: readonly string[]): Promise<Record<string, Label[]>>;
  create(boardId: string, input: LabelInput): Promise<Label>;
  update(id: string, input: LabelInput): Promise<void>;
  remove(id: string): Promise<void>;
  // Recria as etiquetas exatamente como eram (desfazer a exclusão do quadro).
  restoreAll(labels: readonly Label[]): Promise<void>;
  // Substitui todas as etiquetas do cartão pelas informadas.
  setForCard(cardId: string, labelIds: readonly string[]): Promise<void>;
}

export function createLabelRepository(database: Database = db): LabelRepository {
  return {
    async listByBoard(boardId) {
      const rows = database
        .select()
        .from(labels)
        .where(eq(labels.boardId, boardId))
        .orderBy(asc(labels.name))
        .all();
      return parseRows(labelSchema, rows, 'labels');
    },

    async listByCard(cardId) {
      const rows = database
        .select({ label: labels })
        .from(cardLabels)
        .innerJoin(labels, eq(cardLabels.labelId, labels.id))
        .where(eq(cardLabels.cardId, cardId))
        .orderBy(asc(labels.name))
        .all();
      return parseRows(
        labelSchema,
        rows.map((row) => row.label),
        'labels',
      );
    },

    async listByCards(cardIds) {
      if (cardIds.length === 0) return {};
      const rows = database
        .select({ cardId: cardLabels.cardId, label: labels })
        .from(cardLabels)
        .innerJoin(labels, eq(cardLabels.labelId, labels.id))
        .where(inArray(cardLabels.cardId, [...cardIds]))
        .orderBy(asc(labels.name))
        .all();
      return rows.reduce<Record<string, Label[]>>((byCard, row) => {
        const label = parseRow(labelSchema, row.label, 'labels');
        return { ...byCard, [row.cardId]: [...(byCard[row.cardId] ?? []), label] };
      }, {});
    },

    async create(boardId, { name, color }) {
      const now = nowIso();
      const row = database
        .insert(labels)
        .values({ id: createId(), boardId, name, color, createdAt: now, updatedAt: now })
        .returning()
        .get();
      return parseRow(labelSchema, row, 'labels');
    },

    async update(id, { name, color }) {
      database
        .update(labels)
        .set({ name, color, updatedAt: nowIso() })
        .where(eq(labels.id, id))
        .run();
    },

    async remove(id) {
      database.delete(labels).where(eq(labels.id, id)).run();
    },

    async restoreAll(boardLabels) {
      if (boardLabels.length === 0) return;
      database
        .insert(labels)
        .values([...boardLabels])
        .run();
    },

    async setForCard(cardId, labelIds) {
      database.transaction((tx) => {
        tx.delete(cardLabels).where(eq(cardLabels.cardId, cardId)).run();
        if (labelIds.length > 0) {
          tx.insert(cardLabels)
            .values(labelIds.map((labelId) => ({ cardId, labelId })))
            .run();
        }
      });
    },
  };
}

export const labelRepository = createLabelRepository();
