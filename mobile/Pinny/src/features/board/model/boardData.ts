import type { Card } from '@/features/card/model/card.schema';
import { type CardRepository, cardRepository } from '@/features/card/model/cardRepository';
import {
  type ChecklistProgress,
  type ChecklistRepository,
  checklistRepository,
} from '@/features/card/model/checklistRepository';
import { type FolderRepository, folderRepository } from '@/features/folders/model/folderRepository';

import type { Board, Column, Label } from './board.schema';
import { type BoardRepository, boardRepository } from './boardRepository';
import { type ColumnRepository, columnRepository } from './columnRepository';
import { type LabelRepository, labelRepository } from './labelRepository';
import { moveIndex } from './reorder';

export interface BoardCard {
  card: Card;
  labels: Label[];
  checklist: ChecklistProgress | null;
}

export interface BoardColumn {
  column: Column;
  cards: BoardCard[];
}

export interface BoardData {
  board: Board;
  folderTitle: string;
  columns: BoardColumn[];
}

interface BoardRepositories {
  boards: BoardRepository;
  folders: FolderRepository;
  columns: ColumnRepository;
  cards: CardRepository;
  labels: LabelRepository;
  checklist: ChecklistRepository;
}

const defaultRepositories: BoardRepositories = {
  boards: boardRepository,
  folders: folderRepository,
  columns: columnRepository,
  cards: cardRepository,
  labels: labelRepository,
  checklist: checklistRepository,
};

// Tudo o que a tela do quadro mostra. Etiquetas e checklist vêm numa consulta só para todos
// os cartões (sem uma consulta por cartão). null = o quadro não existe mais.
export async function loadBoard(
  boardId: string,
  repositories: BoardRepositories = defaultRepositories,
): Promise<BoardData | null> {
  const board = await repositories.boards.getById(boardId);
  if (!board) return null;

  const [folder, columns] = await Promise.all([
    repositories.folders.getById(board.folderId),
    repositories.columns.listByBoard(board.id),
  ]);
  const cardsByColumn = await Promise.all(
    columns.map((column) => repositories.cards.listByColumn(column.id)),
  );

  const cardIds = cardsByColumn.flat().map((card) => card.id);
  const [labelsByCard, progressByCard] = await Promise.all([
    repositories.labels.listByCards(cardIds),
    repositories.checklist.progressByCards(cardIds),
  ]);

  return {
    board,
    folderTitle: folder?.title ?? '',
    columns: columns.map((column, index) => ({
      column,
      cards: (cardsByColumn[index] ?? []).map((card) => ({
        card,
        labels: labelsByCard[card.id] ?? [],
        checklist: progressByCard[card.id] ?? null,
      })),
    })),
  };
}

export interface CardMoveResult {
  data: BoardData;
  // Ordem final dos ids na coluna (para calcular os vizinhos ao gravar).
  orderedIds: string[];
  // Posição do cartão antes do movimento (para o "Desfazer").
  previousPosition: number;
}

// Novo retrato do quadro com o cartão levado para toIndex dentro da coluna, sem alterar o original.
// null = nada mudou (coluna ou cartão inexistente, ou mesma vaga).
export function withCardMoved(
  data: BoardData,
  columnId: string,
  cardId: string,
  toIndex: number,
): CardMoveResult | null {
  const target = data.columns.find((item) => item.column.id === columnId);
  const fromIndex = target?.cards.findIndex((item) => item.card.id === cardId) ?? -1;
  const movedCard = target?.cards[fromIndex];
  if (!target || !movedCard || fromIndex === toIndex) return null;

  const cards = moveIndex(target.cards, fromIndex, toIndex);
  return {
    data: {
      ...data,
      columns: data.columns.map((item) => (item === target ? { ...item, cards } : item)),
    },
    orderedIds: cards.map((item) => item.card.id),
    previousPosition: movedCard.card.position,
  };
}
