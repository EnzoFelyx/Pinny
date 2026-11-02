import { and, asc, eq, isNull, ne } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { applyPlacement } from '@/db/ordering';
import { cards } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { type Placement, positionAtEnd } from '@/utils/position';
import { nowIso } from '@/utils/time';

import { type Card, type CardSnapshot, cardSchema } from './card.schema';
import { copySnapshot, insertSnapshot, snapshotOf } from './cardSnapshots';
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
  // Exclui todos os cartões da coluna (inclusive arquivados) e devolve os retratos, em ordem.
  removeByColumn(columnId: string): Promise<CardSnapshot[]>;
  // Copia os cartões ativos de uma coluna para outra (vazia), na mesma ordem, com etiquetas e
  // checklist ("Duplicar coluna"). Os anexos não vão junto: a foto continuaria sendo do original.
  copyToColumn(fromColumnId: string, toColumnId: string): Promise<void>;
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
        const snapshot = snapshotOf(tx, card);
        // Etiquetas, checklist e anexos saem junto (cascata).
        tx.delete(cards).where(eq(cards.id, id)).run();
        return snapshot;
      });
    },

    async removeByColumn(columnId) {
      return database.transaction((tx) => {
        // Todos, inclusive os arquivados: a exclusão da coluna levaria todos eles (cascata).
        const rows = tx
          .select()
          .from(cards)
          .where(eq(cards.columnId, columnId))
          .orderBy(asc(cards.position))
          .all();
        const snapshots = rows.map((card) => snapshotOf(tx, card));
        tx.delete(cards).where(eq(cards.columnId, columnId)).run();
        return snapshots;
      });
    },

    async copyToColumn(fromColumnId, toColumnId) {
      database.transaction((tx) => {
        const now = nowIso();
        const rows = tx
          .select()
          .from(cards)
          .where(and(eq(cards.columnId, fromColumnId), isNull(cards.archivedAt)))
          .orderBy(asc(cards.position))
          .all();
        for (const card of rows) {
          insertSnapshot(tx, copySnapshot(snapshotOf(tx, card), toColumnId, now));
        }
      });
    },

    async restore(snapshot) {
      database.transaction((tx) => insertSnapshot(tx, snapshot));
    },
  };
}

export const cardRepository = createCardRepository();
