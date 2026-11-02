import { inArray } from 'drizzle-orm';

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

// Ids por consulta e linhas por INSERT: abaixo do limite de variáveis do SQLite.
const QUERY_CHUNK = 500;
const INSERT_CHUNK = 200;

function chunksOf<T>(items: readonly T[], size = QUERY_CHUNK): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

function groupByCard<Row extends { cardId: string }>(rows: readonly Row[]): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) groups.set(row.cardId, [...(groups.get(row.cardId) ?? []), row]);
  return groups;
}

// Retratos de vários cartões, na mesma ordem: 3 consultas por lote (etiquetas, checklist e
// anexos de todos), em vez de 3 por cartão. As consultas são síncronas e travariam a tela numa
// coluna cheia.
export function snapshotsOf(tx: Transaction, rows: readonly CardRow[]): CardSnapshot[] {
  const ids = rows.map((card) => card.id);
  const labelRows = chunksOf(ids).flatMap((chunk) =>
    tx
      .select({ cardId: cardLabels.cardId, labelId: cardLabels.labelId })
      .from(cardLabels)
      .where(inArray(cardLabels.cardId, chunk))
      .all(),
  );
  const checklistRows = chunksOf(ids).flatMap((chunk) =>
    tx.select().from(checklistItems).where(inArray(checklistItems.cardId, chunk)).all(),
  );
  const attachmentRows = chunksOf(ids).flatMap((chunk) =>
    tx.select().from(attachments).where(inArray(attachments.cardId, chunk)).all(),
  );
  const labelsByCard = groupByCard(labelRows);
  const checklistByCard = groupByCard(checklistRows);
  const attachmentsByCard = groupByCard(attachmentRows);
  return rows.map((card) =>
    parseRow(
      cardSnapshotSchema,
      {
        card,
        labelIds: (labelsByCard.get(card.id) ?? []).map((row) => row.labelId),
        checklist: checklistByCard.get(card.id) ?? [],
        attachments: attachmentsByCard.get(card.id) ?? [],
      },
      'cards',
    ),
  );
}

// Grava os cartões dos retratos com tudo o que é deles: um INSERT por tabela (em lotes), em vez
// de até quatro por cartão.
export function insertSnapshots(tx: Transaction, snapshots: readonly CardSnapshot[]): void {
  const cardRows = parseRows(
    cardSchema,
    snapshots.map((snapshot) => snapshot.card),
    'cards',
  );
  const labelRows = snapshots.flatMap(({ card, labelIds }) =>
    labelIds.map((labelId) => ({ cardId: card.id, labelId })),
  );
  const checklistRows = parseRows(
    checklistItemSchema,
    snapshots.flatMap((snapshot) => snapshot.checklist),
    'checklist_items',
  );
  const attachmentRows = parseRows(
    attachmentSchema,
    snapshots.flatMap((snapshot) => snapshot.attachments),
    'attachments',
  );
  // Linhas por INSERT: com ~12 campos, bem abaixo do limite de variáveis do SQLite.
  chunksOf(cardRows, INSERT_CHUNK).forEach((chunk) => tx.insert(cards).values(chunk).run());
  chunksOf(labelRows, INSERT_CHUNK).forEach((chunk) => tx.insert(cardLabels).values(chunk).run());
  chunksOf(checklistRows, INSERT_CHUNK).forEach((chunk) =>
    tx.insert(checklistItems).values(chunk).run(),
  );
  chunksOf(attachmentRows, INSERT_CHUNK).forEach((chunk) =>
    tx.insert(attachments).values(chunk).run(),
  );
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
