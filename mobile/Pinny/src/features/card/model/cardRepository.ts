import { and, asc, eq, isNull, ne } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { applyPlacement } from '@/db/ordering';
import { attachments, cardLabels, cards, checklistItems } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import {
  type Card,
  type CardSnapshot,
  attachmentSchema,
  cardSchema,
  cardSnapshotSchema,
  checklistItemSchema,
} from './card.schema';
import type { Priority } from './card.types';

export interface NewCardInput {
  columnId: string;
  title: string;
  description?: string;
  priority?: Priority | null;
  dueAt?: string | null;
}

export type CardPatch = Partial<
  Pick<Card, 'title' | 'description' | 'priority' | 'dueAt' | 'completedAt' | 'archivedAt'>
>;

export interface CardRepository {
  // Cartões ativos (não arquivados) da coluna, em ordem.
  listByColumn(columnId: string): Promise<Card[]>;
  getById(id: string): Promise<Card | null>;
  create(input: NewCardInput): Promise<Card>;
  update(id: string, patch: CardPatch): Promise<void>;
  // Mesma coluna ou outra: o cartão fica entre previousId e nextId da coluna de destino.
  move(id: string, columnId: string, placement: Placement): Promise<void>;
  // Volta o cartão a uma posição exata (usado pelo "Desfazer").
  moveToPosition(id: string, columnId: string, position: number): Promise<void>;
  // Exclui e devolve o retrato completo, para o "Desfazer".
  remove(id: string): Promise<CardSnapshot>;
  restore(snapshot: CardSnapshot): Promise<void>;
}

export function createCardRepository(database: Database = db): CardRepository {
  const siblingsOf = (columnId: string, excludeId?: string) =>
    database
      .select({ id: cards.id, position: cards.position })
      .from(cards)
      .where(
        excludeId
          ? and(eq(cards.columnId, columnId), ne(cards.id, excludeId))
          : eq(cards.columnId, columnId),
      )
      .orderBy(asc(cards.position))
      .all();

  return {
    async listByColumn(columnId) {
      const rows = database
        .select()
        .from(cards)
        .where(and(eq(cards.columnId, columnId), isNull(cards.archivedAt)))
        .orderBy(asc(cards.position))
        .all();
      return parseRows(cardSchema, rows, 'cards');
    },

    async getById(id) {
      const row = database.select().from(cards).where(eq(cards.id, id)).get();
      return row ? parseRow(cardSchema, row, 'cards') : null;
    },

    async create({ columnId, title, description = '', priority = null, dueAt = null }) {
      const now = nowIso();
      const row = database
        .insert(cards)
        .values({
          id: createId(),
          columnId,
          title,
          description,
          priority,
          dueAt,
          position: positionAtEnd(siblingsOf(columnId)),
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      return parseRow(cardSchema, row, 'cards');
    },

    async update(id, patch) {
      database
        .update(cards)
        .set({ ...patch, updatedAt: nowIso() })
        .where(eq(cards.id, id))
        .run();
    },

    async move(id, columnId, placement) {
      database.transaction((tx) => {
        const position = applyPlacement(
          siblingsOf(columnId, id),
          placement,
          (itemId, itemPosition) =>
            tx.update(cards).set({ position: itemPosition }).where(eq(cards.id, itemId)).run(),
        );
        tx.update(cards)
          .set({ columnId, position, updatedAt: nowIso() })
          .where(eq(cards.id, id))
          .run();
      });
    },

    async moveToPosition(id, columnId, position) {
      database
        .update(cards)
        .set({ columnId, position, updatedAt: nowIso() })
        .where(eq(cards.id, id))
        .run();
    },

    async remove(id) {
      return database.transaction((tx) => {
        const card = tx.select().from(cards).where(eq(cards.id, id)).get();
        if (!card) throw new Error(`Cartão "${id}" não encontrado.`);

        const snapshot = parseRow(
          cardSnapshotSchema,
          {
            card,
            labelIds: tx
              .select({ labelId: cardLabels.labelId })
              .from(cardLabels)
              .where(eq(cardLabels.cardId, id))
              .all()
              .map((row) => row.labelId),
            checklist: tx.select().from(checklistItems).where(eq(checklistItems.cardId, id)).all(),
            attachments: tx.select().from(attachments).where(eq(attachments.cardId, id)).all(),
          },
          'cards',
        );

        // Etiquetas, checklist e anexos saem junto (cascata).
        tx.delete(cards).where(eq(cards.id, id)).run();
        return snapshot;
      });
    },

    async restore({ card, labelIds, checklist, attachments: cardAttachments }) {
      database.transaction((tx) => {
        tx.insert(cards)
          .values(parseRow(cardSchema, card, 'cards'))
          .run();
        if (labelIds.length > 0) {
          tx.insert(cardLabels)
            .values(labelIds.map((labelId) => ({ cardId: card.id, labelId })))
            .run();
        }
        if (checklist.length > 0) {
          tx.insert(checklistItems)
            .values(parseRows(checklistItemSchema, checklist, 'checklist_items'))
            .run();
        }
        if (cardAttachments.length > 0) {
          tx.insert(attachments)
            .values(parseRows(attachmentSchema, cardAttachments, 'attachments'))
            .run();
        }
      });
    },
  };
}

export const cardRepository = createCardRepository();
