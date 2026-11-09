import type { Card } from '@/features/card/model/card.schema';
import type { CardRepository } from '@/features/card/model/cardRepository';
import type { UndoOperation } from '@/features/history/model/actionHistory';
import { nowIso } from '@/utils/time';

import type { LabelRepository } from './labelRepository';

// Ações sobre vários cartões de uma vez (modo "Selecionar" do quadro). Cada uma grava tudo e
// devolve a operação que desfaz o lote inteiro: no histórico, o lote é uma ação só.

export interface CardBatchRepositories {
  cards: CardRepository;
  labels: LabelRepository;
}

function asSequence(operations: UndoOperation[]): UndoOperation {
  return operations.length === 1 && operations[0]
    ? operations[0]
    : { kind: 'sequence', operations };
}

async function existingCards(cardIds: readonly string[], cards: CardRepository): Promise<Card[]> {
  const found = await Promise.all(cardIds.map((id) => cards.getById(id)));
  return found.filter((card): card is Card => card !== null);
}

// Arquivar: some do quadro sem apagar. Desfazer devolve cada um ao mesmo lugar.
export async function archiveCards(
  cardIds: readonly string[],
  cards: CardRepository,
): Promise<UndoOperation> {
  const archivedAt = nowIso();
  for (const id of cardIds) await cards.update(id, { archivedAt });
  return asSequence(
    cardIds.map((cardId) => ({ kind: 'updateCard', cardId, previous: { archivedAt: null } })),
  );
}

// Apagar: uma transação só; desfazer recria todos com etiquetas, checklist e anexos.
export async function removeCards(
  cardIds: readonly string[],
  cards: CardRepository,
): Promise<UndoOperation> {
  const snapshots = await cards.removeMany(cardIds);
  return { kind: 'restoreCards', snapshots };
}

// Etiquetas do quadro de destino com o mesmo nome e cor das usadas pelos cartões (as que faltam
// são criadas lá). As etiquetas são de cada quadro: sem isso, o cartão chegaria sem elas.
async function labelMapFor(
  cardIds: readonly string[],
  toBoardId: string,
  labels: LabelRepository,
): Promise<Map<string, string>> {
  const used = Object.values(await labels.listByCards(cardIds)).flat();
  const targets = await labels.listByBoard(toBoardId);
  const map = new Map<string, string>();
  for (const label of used) {
    if (map.has(label.id)) continue;
    const match = targets.find(
      (target) => target.name === label.name && target.color === label.color,
    );
    const target =
      match ?? (await labels.create(toBoardId, { name: label.name, color: label.color }));
    if (!match) targets.push(target);
    map.set(label.id, target.id);
  }
  return map;
}

interface MoveTarget {
  columnId: string;
  // Quadro de destino diferente do de origem: as etiquetas são trocadas pelas de lá.
  toBoardId: string | null;
}

// Mover: os cartões vão para o fim da coluna de destino, na ordem dada (a do quadro). Desfazer
// volta cada um à coluna, à posição e às etiquetas de antes.
export async function moveCards(
  cardIds: readonly string[],
  { columnId, toBoardId }: MoveTarget,
  { cards, labels }: CardBatchRepositories,
): Promise<UndoOperation> {
  const moving = await existingCards(cardIds, cards);
  const movingIds = new Set(moving.map((card) => card.id));
  const siblings = (await cards.listByColumn(columnId)).filter((card) => !movingIds.has(card.id));
  const labelMap = toBoardId ? await labelMapFor([...movingIds], toBoardId, labels) : null;
  const previousLabels = labelMap ? await labels.listByCards([...movingIds]) : {};

  const operations: UndoOperation[] = [];
  let previousId = siblings.at(-1)?.id ?? null;
  for (const card of moving) {
    await cards.move(card.id, columnId, { previousId, nextId: null });
    previousId = card.id;
    operations.push({
      kind: 'moveCard',
      cardId: card.id,
      columnId: card.columnId,
      position: card.position,
    });
    if (!labelMap) continue;
    const before = (previousLabels[card.id] ?? []).map((label) => label.id);
    if (before.length === 0) continue;
    await labels.setForCard(
      card.id,
      before.flatMap((id) => labelMap.get(id) ?? []),
    );
    operations.push({ kind: 'setCardLabels', cardId: card.id, labelIds: before });
  }
  return asSequence(operations);
}
