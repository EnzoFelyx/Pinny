import { type CardRepository, cardRepository } from '@/features/card/model/cardRepository';
import {
  type ChecklistRepository,
  checklistRepository,
} from '@/features/card/model/checklistRepository';

import type { Board } from './board.schema';
import type { BoardCard } from './boardData';
import { type BoardRepository, boardRepository } from './boardRepository';
import { type ColumnRepository, columnRepository } from './columnRepository';
import { type LabelRepository, labelRepository } from './labelRepository';

export interface ArchivedCardsData {
  board: Board;
  // Do arquivado mais recente para o mais antigo.
  cards: BoardCard[];
}

interface ArchivedRepositories {
  boards: BoardRepository;
  columns: ColumnRepository;
  cards: CardRepository;
  labels: LabelRepository;
  checklist: ChecklistRepository;
}

const defaultRepositories: ArchivedRepositories = {
  boards: boardRepository,
  columns: columnRepository,
  cards: cardRepository,
  labels: labelRepository,
  checklist: checklistRepository,
};

// Cartões arquivados do quadro (de todas as colunas), com etiquetas e checklist numa consulta só.
// null = o quadro não existe mais.
export async function loadArchivedCards(
  boardId: string,
  repositories: ArchivedRepositories = defaultRepositories,
): Promise<ArchivedCardsData | null> {
  const board = await repositories.boards.getById(boardId);
  if (!board) return null;
  const columns = await repositories.columns.listByBoard(board.id);
  const cards = await repositories.cards.listArchivedByColumns(columns.map((column) => column.id));
  const cardIds = cards.map((card) => card.id);
  const [labelsByCard, progressByCard] = await Promise.all([
    repositories.labels.listByCards(cardIds),
    repositories.checklist.progressByCards(cardIds),
  ]);
  return {
    board,
    cards: cards.map((card) => ({
      card,
      labels: labelsByCard[card.id] ?? [],
      checklist: progressByCard[card.id] ?? null,
    })),
  };
}
