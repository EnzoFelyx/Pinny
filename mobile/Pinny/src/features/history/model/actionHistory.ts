import { HISTORY_LIMIT } from '@/constants/limits';
import type { CardSnapshot } from '@/features/card/model/card.schema';
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
  // Texto pronto para o snackbar (ex.: "Cartão movido para Concluído").
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

export async function applyUndo(
  operation: UndoOperation,
  repositories: UndoRepositories,
): Promise<void> {
  switch (operation.kind) {
    case 'deleteCard':
      await repositories.cards.remove(operation.cardId);
      return;
    case 'moveCard':
      await repositories.cards.moveToPosition(
        operation.cardId,
        operation.columnId,
        operation.position,
      );
      return;
    case 'updateCard':
      await repositories.cards.update(operation.cardId, operation.previous);
      return;
    case 'restoreCard':
      await repositories.cards.restore(operation.snapshot);
      return;
  }
}
