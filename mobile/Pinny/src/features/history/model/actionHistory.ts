import { HISTORY_LIMIT } from '@/constants/limits';
import type { Card, CardSnapshot } from '@/features/card/model/card.schema';
import type { CardPatch, CardRepository } from '@/features/card/model/cardRepository';
import {
  type ColumnSnapshot,
  removeColumnWithCards,
  restoreColumnWithCards,
} from '@/features/board/model/columnRemoval';
import {
  type BoardSnapshot,
  removeBoardWithContent,
  restoreBoardWithContent,
} from '@/features/board/model/boardRemoval';
import { type BoardPlace, restoreBoardPlace } from '@/features/board/model/boardMove';
import type { BoardRepository } from '@/features/board/model/boardRepository';
import type { ColumnRepository } from '@/features/board/model/columnRepository';
import type { LabelRepository } from '@/features/board/model/labelRepository';

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
  | { kind: 'restoreCard'; snapshot: CardSnapshot }
  // Desfaz a criação de uma coluna: exclui a coluna e os cartões dela, guardando o retrato.
  | { kind: 'deleteColumn'; columnId: string }
  // Desfaz uma exclusão de coluna: recria a coluna e os cartões com os mesmos ids e posições.
  | { kind: 'restoreColumn'; snapshot: ColumnSnapshot }
  // Desfaz um movimento de coluna: volta à posição exata de antes.
  | { kind: 'moveColumn'; columnId: string; position: number }
  // Desfaz uma renomeação: volta ao nome anterior.
  | { kind: 'renameColumn'; columnId: string; title: string }
  // Desfaz uma renomeação de quadro: volta ao nome anterior.
  | { kind: 'renameBoard'; boardId: string; title: string }
  // Refaz a exclusão de um quadro: exclui de novo, guardando o retrato.
  | { kind: 'deleteBoard'; boardId: string }
  // Desfaz uma exclusão de quadro: recria o quadro, as etiquetas, as colunas e os cartões.
  | { kind: 'restoreBoard'; snapshot: BoardSnapshot }
  // Desfaz "Mover para outra pasta": volta à pasta, à posição e à fixação de antes.
  | { kind: 'moveBoard'; place: BoardPlace }
  // Várias operações como uma ação só (ex.: criar a coluna e levar o cartão para ela). Desfaz na
  // ordem dada; a inversa refaz na ordem contrária.
  | { kind: 'sequence'; operations: UndoOperation[] };

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

// A operação recriaria um quadro fixado nesta pasta (inclusive dentro de uma sequência).
export function restoresPinnedBoardIn(operation: UndoOperation, folderId: string): boolean {
  if (operation.kind === 'sequence') {
    return operation.operations.some((step) => restoresPinnedBoardIn(step, folderId));
  }
  return (
    operation.kind === 'restoreBoard' &&
    operation.snapshot.board.folderId === folderId &&
    operation.snapshot.board.pinnedAt !== null
  );
}

export interface UndoRepositories {
  cards: CardRepository;
  columns: ColumnRepository;
  boards: BoardRepository;
  labels: LabelRepository;
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
  const { cards, columns, boards } = repositories;
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
    case 'deleteColumn': {
      const snapshot = await removeColumnWithCards(operation.columnId, { columns, cards });
      return snapshot ? { kind: 'restoreColumn', snapshot } : null;
    }
    case 'restoreColumn':
      await restoreColumnWithCards(operation.snapshot, { columns, cards });
      return { kind: 'deleteColumn', columnId: operation.snapshot.column.id };
    case 'moveColumn': {
      const before = await columns.getById(operation.columnId);
      if (!before) return null;
      await columns.moveToPosition(operation.columnId, operation.position);
      return { kind: 'moveColumn', columnId: before.id, position: before.position };
    }
    case 'sequence': {
      const inverses: UndoOperation[] = [];
      for (const step of operation.operations) {
        const inverse = await applyUndo(step, repositories);
        if (inverse) inverses.unshift(inverse);
      }
      return { kind: 'sequence', operations: inverses };
    }
    case 'renameColumn': {
      const before = await columns.getById(operation.columnId);
      if (!before) return null;
      await columns.rename(operation.columnId, operation.title);
      return { kind: 'renameColumn', columnId: before.id, title: before.title };
    }
    case 'renameBoard': {
      const before = await boards.getById(operation.boardId);
      if (!before) return null;
      await boards.rename(operation.boardId, operation.title);
      return { kind: 'renameBoard', boardId: before.id, title: before.title };
    }
    case 'deleteBoard': {
      const snapshot = await removeBoardWithContent(operation.boardId, repositories);
      return snapshot ? { kind: 'restoreBoard', snapshot } : null;
    }
    case 'restoreBoard':
      await restoreBoardWithContent(operation.snapshot, repositories);
      return { kind: 'deleteBoard', boardId: operation.snapshot.board.id };
    case 'moveBoard': {
      const place = await restoreBoardPlace(operation.place, boards);
      return place ? { kind: 'moveBoard', place } : null;
    }
  }
}
