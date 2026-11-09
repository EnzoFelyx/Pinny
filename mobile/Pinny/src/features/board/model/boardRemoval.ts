import type { CardRepository } from '@/features/card/model/cardRepository';

import type { Board, Label } from './board.schema';
import type { BoardRepository } from './boardRepository';
import {
  type ColumnSnapshot,
  removeColumnWithCards,
  restoreColumnWithCards,
} from './columnRemoval';
import type { ColumnRepository } from './columnRepository';
import type { LabelRepository } from './labelRepository';

// Retrato de um quadro excluído: ele, as etiquetas e cada coluna com os cartões, para o
// "Desfazer" recriar tudo.
export interface BoardSnapshot {
  board: Board;
  labels: Label[];
  columns: ColumnSnapshot[];
}

export interface BoardRemovalRepositories {
  boards: BoardRepository;
  columns: ColumnRepository;
  cards: CardRepository;
  labels: LabelRepository;
}

// Exclui o quadro com colunas, cartões (inclusive arquivados) e etiquetas, devolvendo o retrato.
// null = o quadro não existe mais.
export async function removeBoardWithContent(
  boardId: string,
  repositories: BoardRemovalRepositories,
): Promise<BoardSnapshot | null> {
  const board = await repositories.boards.getById(boardId);
  if (!board) return null;
  // Etiquetas antes dos cartões: o retrato de cada cartão guarda só os ids delas.
  const labels = await repositories.labels.listByBoard(boardId);
  const boardColumns = await repositories.columns.listByBoard(boardId);
  const columnSnapshots: ColumnSnapshot[] = [];
  for (const column of boardColumns) {
    const snapshot = await removeColumnWithCards(column.id, repositories);
    if (snapshot) columnSnapshots.push(snapshot);
  }
  // O banco apaga as etiquetas junto com o quadro (cascade).
  await repositories.boards.remove(boardId);
  return { board, labels, columns: columnSnapshots };
}

// Recria o quadro exatamente como era (mesmos ids, nomes, posições e fixação).
export async function restoreBoardWithContent(
  { board, labels, columns }: BoardSnapshot,
  repositories: BoardRemovalRepositories,
): Promise<void> {
  await repositories.boards.restore(board);
  await repositories.labels.restoreAll(labels);
  for (const snapshot of columns) {
    await restoreColumnWithCards(snapshot, repositories);
  }
}
