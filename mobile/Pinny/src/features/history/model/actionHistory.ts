import { HISTORY_LIMIT } from '@/constants/limits';
import type { Card, CardSnapshot } from '@/features/card/model/card.schema';
import type { CardPatch, CardRepository } from '@/features/card/model/cardRepository';

// Histórico de ações (base do "Desfazer"). Cada entrada guarda como voltar ao estado anterior.
// Novos tipos entram conforme as ações chegam (ex.: excluir coluna na etapa 6).

export type UndoOperation =
  // Desfaz a criação de um cartão.
  | { kind: 'deleteCard'; cardId: string }
  // Desfaz um movimento: volta à coluna e à posição exatas de antes.
  | { kind: 'moveCard'; cardId: string; columnId: string; position: number }
  // Desfaz uma edição: regrava os valores anteriores dos campos alterados.
  | { kind: 'updateCard'; cardId: string; previous: CardPatch }
  // Desfaz uma exclusão: recria o cartão com etiquetas, checklist e anexos.
  | { kind: 'restoreCard'; snapshot: CardSnapshot };

export interface HistoryEntry {
  id: string;
  // Nome da ação no estilo do iOS, usado no alerta do chacoalhar (ex.: "Movimento" vira
  // "Desfazer Movimento").
  description: string;
  createdAt: string;
  undo: UndoOperation;
}

// Funções puras: a pilha nunca é alterada, sempre devolvemos uma nova.

export function pushEntry(
  history: readonly HistoryEntry[],
  entry: HistoryEntry,
  limit: number = HISTORY_LIMIT,
): readonly HistoryEntry[] {
  return [...history, entry].slice(-limit);
}

export function popEntry(history: readonly HistoryEntry[]): {
  entry: HistoryEntry | undefined;
  rest: readonly HistoryEntry[];
} {
  return { entry: history.at(-1), rest: history.slice(0, -1) };
}

export interface UndoRepositories {
  cards: CardRepository;
}

// Campos do patch com os valores atuais do cartão: o que é preciso para voltar uma edição.
function currentValuesOf(card: Card, patch: CardPatch): CardPatch {
  const fields = Object.keys(patch) as (keyof CardPatch)[];
  return fields.reduce<CardPatch>((values, field) => ({ ...values, [field]: card[field] }), {});
}

// Aplica a operação e devolve a inversa dela (o que refaz o que acabou de ser desfeito).
// null = não há como inverter (ex.: o cartão não existe mais).
export async function applyUndo(
  operation: UndoOperation,
  repositories: UndoRepositories,
): Promise<UndoOperation | null> {
  const { cards } = repositories;
  switch (operation.kind) {
    case 'deleteCard': {
      const snapshot = await cards.remove(operation.cardId);
      return { kind: 'restoreCard', snapshot };
    }
    case 'moveCard': {
      const before = await cards.getById(operation.cardId);
      await cards.moveToPosition(operation.cardId, operation.columnId, operation.position);
      return before
        ? {
            kind: 'moveCard',
            cardId: before.id,
            columnId: before.columnId,
            position: before.position,
          }
        : null;
    }
    case 'updateCard': {
      const before = await cards.getById(operation.cardId);
      await cards.update(operation.cardId, operation.previous);
      return before
        ? {
            kind: 'updateCard',
            cardId: before.id,
            previous: currentValuesOf(before, operation.previous),
          }
        : null;
    }
    case 'restoreCard':
      await cards.restore(operation.snapshot);
      return { kind: 'deleteCard', cardId: operation.snapshot.card.id };
  }
}
