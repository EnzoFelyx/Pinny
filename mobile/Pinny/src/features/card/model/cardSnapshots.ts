import { eq } from 'drizzle-orm';

import type { Database } from '@/db/client';
import { attachments, cardLabels, cards, checklistItems } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';

import {
  type CardSnapshot,
  attachmentSchema,
  cardSchema,
  cardSnapshotSchema,
  checklistItemSchema,
} from './card.schema';

// Retratos completos de cartões (cartão, etiquetas, checklist e anexos), usados pelo "Desfazer"
// para recriar um cartão igual e pelo "Duplicar coluna" para copiá-lo. Sempre dentro de uma
// transação do cardRepository.

export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
type CardRow = typeof cards.$inferSelect;

export function snapshotOf(tx: Transaction, card: CardRow): CardSnapshot {
  return parseRow(
    cardSnapshotSchema,
    {
      card,
      labelIds: tx
        .select({ labelId: cardLabels.labelId })
        .from(cardLabels)
        .where(eq(cardLabels.cardId, card.id))
        .all()
        .map((row) => row.labelId),
      checklist: tx.select().from(checklistItems).where(eq(checklistItems.cardId, card.id)).all(),
      attachments: tx.select().from(attachments).where(eq(attachments.cardId, card.id)).all(),
    },
    'cards',
  );
}

// Grava o cartão do retrato com tudo o que é dele.
export function insertSnapshot(
  tx: Transaction,
  { card, labelIds, checklist, attachments: cardAttachments }: CardSnapshot,
): void {
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
}

// Cópia do retrato em outra coluna, com ids novos (cartão e itens do checklist). Os anexos não
// vão junto: a foto continuaria sendo do original.
export function copySnapshot(
  snapshot: CardSnapshot,
  toColumnId: string,
  now: string,
): CardSnapshot {
  const copyId = createId();
  return {
    card: { ...snapshot.card, id: copyId, columnId: toColumnId, createdAt: now, updatedAt: now },
    labelIds: snapshot.labelIds,
    checklist: snapshot.checklist.map((item) => ({
      ...item,
      id: createId(),
      cardId: copyId,
      createdAt: now,
      updatedAt: now,
    })),
    attachments: [],
  };
}
