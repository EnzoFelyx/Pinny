import type { Label } from '@/features/board/model/board.schema';
import type { LabelRepository } from '@/features/board/model/labelRepository';
import { normalizeForSearch } from '@/utils/text';

import type { LabelColor } from './card.types';
import type { UndoOperation } from '@/features/history/model/actionHistory';

import type { CardPatch, CardRepository } from './cardRepository';
import type { ChecklistRepository } from './checklistRepository';

// Edições do detalhe do cartão. Cada uma grava e devolve a operação que a desfaz (null = nada
// mudou, nada vai para o histórico).

// Título, descrição, prioridade, prazo, concluído: grava só os campos que mudaram.
export async function updateCardFields(
  cardId: string,
  patch: CardPatch,
  cards: CardRepository,
): Promise<UndoOperation | null> {
  const card = await cards.getById(cardId);
  if (!card) return null;
  const fields = (Object.keys(patch) as (keyof CardPatch)[]).filter(
    (field) => patch[field] !== card[field],
  );
  if (fields.length === 0) return null;
  const changed = Object.fromEntries(fields.map((field) => [field, patch[field]])) as CardPatch;
  const previous = Object.fromEntries(fields.map((field) => [field, card[field]])) as CardPatch;
  await cards.update(cardId, changed);
  return { kind: 'updateCard', cardId, previous };
}

export async function setCardLabels(
  cardId: string,
  labelIds: readonly string[],
  labels: LabelRepository,
): Promise<UndoOperation> {
  const before = (await labels.listByCard(cardId)).map((label) => label.id);
  await labels.setForCard(cardId, labelIds);
  return { kind: 'setCardLabels', cardId, labelIds: before };
}

// Etiqueta nova do cartão: com o mesmo nome de uma do quadro (sem diferenciar acentos e
// maiúsculas), devolve aquela em vez de criar outra igual.
export async function findOrCreateLabel(
  boardId: string,
  input: { name: string; color: LabelColor },
  boardLabels: readonly Label[],
  labels: LabelRepository,
): Promise<Label> {
  const key = normalizeForSearch(input.name);
  const existing = boardLabels.find((label) => normalizeForSearch(label.name) === key);
  return existing ?? labels.create(boardId, input);
}

export async function addChecklistItem(
  cardId: string,
  text: string,
  checklist: ChecklistRepository,
): Promise<UndoOperation> {
  const item = await checklist.add(cardId, text);
  return { kind: 'deleteChecklistItem', itemId: item.id };
}

export async function setChecklistItemDone(
  itemId: string,
  isDone: boolean,
  checklist: ChecklistRepository,
): Promise<UndoOperation | null> {
  const item = await checklist.getById(itemId);
  if (!item || item.isDone === isDone) return null;
  await checklist.setDone(itemId, isDone);
  return { kind: 'setChecklistItemDone', itemId, isDone: item.isDone };
}

export async function renameChecklistItem(
  itemId: string,
  text: string,
  checklist: ChecklistRepository,
): Promise<UndoOperation | null> {
  const item = await checklist.getById(itemId);
  if (!item || item.text === text) return null;
  await checklist.rename(itemId, text);
  return { kind: 'renameChecklistItem', itemId, text: item.text };
}

export async function removeChecklistItem(
  itemId: string,
  checklist: ChecklistRepository,
): Promise<UndoOperation | null> {
  const item = await checklist.getById(itemId);
  if (!item) return null;
  await checklist.remove(itemId);
  return { kind: 'restoreChecklistItem', item };
}
