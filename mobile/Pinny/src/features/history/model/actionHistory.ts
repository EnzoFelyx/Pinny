import { HISTORY_LIMIT } from '@/constants/limits';
import type { CardSnapshot } from '@/features/card/model/card.schema';
import type { CardPatch } from '@/features/card/model/cardRepository';
import type { ColumnSnapshot } from '@/features/board/model/columnRemoval';
import type { BoardSnapshot } from '@/features/board/model/boardRemoval';
import type { BoardPlace } from '@/features/board/model/boardMove';
import type { FolderSnapshot } from '@/features/folders/model/folderRemoval';

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
  // Refaz a exclusão de vários cartões (seleção em lote): exclui de novo, guardando os retratos.
  | { kind: 'deleteCards'; cardIds: string[] }
  // Desfaz a exclusão de vários cartões: recria todos numa transação só.
  | { kind: 'restoreCards'; snapshots: CardSnapshot[] }
  // Desfaz a troca das etiquetas de um cartão (ex.: ao ir para outro quadro): volta às de antes.
  | { kind: 'setCardLabels'; cardId: string; labelIds: string[] }
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
  // Desfaz "Mover quadro": volta à pasta, à posição e à fixação de antes.
  | { kind: 'moveBoard'; place: BoardPlace }
  // Refaz a exclusão de uma pasta: apaga de novo, guardando o retrato.
  | { kind: 'deleteFolder'; folderId: string }
  // Desfaz uma exclusão de pasta: recria a pasta e todos os quadros dela.
  | { kind: 'restoreFolder'; snapshot: FolderSnapshot }
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

// Aplicar uma operação (desfazer ou refazer) fica em applyUndo.ts.
