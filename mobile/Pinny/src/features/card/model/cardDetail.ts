import type { Board, Column, Label } from '@/features/board/model/board.schema';
import { type BoardRepository, boardRepository } from '@/features/board/model/boardRepository';
import { type ColumnRepository, columnRepository } from '@/features/board/model/columnRepository';
import { type LabelRepository, labelRepository } from '@/features/board/model/labelRepository';
import { type FolderRepository, folderRepository } from '@/features/folders/model/folderRepository';

import { type AttachmentRepository, attachmentRepository } from './attachmentRepository';
import type { Attachment, Card, ChecklistItem } from './card.schema';
import { type CardRepository, cardRepository } from './cardRepository';
import { type ChecklistRepository, checklistRepository } from './checklistRepository';

// Tudo o que a folha do detalhe mostra de um cartão.
export interface CardDetail {
  card: Card;
  column: Column;
  board: Board;
  folderTitle: string;
  // Etiquetas do cartão e todas as do quadro (para escolher).
  labels: Label[];
  boardLabels: Label[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
}

interface CardDetailRepositories {
  cards: CardRepository;
  columns: ColumnRepository;
  boards: BoardRepository;
  folders: FolderRepository;
  labels: LabelRepository;
  checklist: ChecklistRepository;
  attachments: AttachmentRepository;
}

const defaultRepositories: CardDetailRepositories = {
  cards: cardRepository,
  columns: columnRepository,
  boards: boardRepository,
  folders: folderRepository,
  labels: labelRepository,
  checklist: checklistRepository,
  attachments: attachmentRepository,
};

// null = o cartão (ou a coluna ou o quadro dele) não existe mais.
export async function loadCardDetail(
  cardId: string,
  repositories: CardDetailRepositories = defaultRepositories,
): Promise<CardDetail | null> {
  const card = await repositories.cards.getById(cardId);
  if (!card) return null;
  const column = await repositories.columns.getById(card.columnId);
  if (!column) return null;
  const board = await repositories.boards.getById(column.boardId);
  if (!board) return null;
  const [folder, labels, boardLabels, checklist, attachments] = await Promise.all([
    repositories.folders.getById(board.folderId),
    repositories.labels.listByCard(cardId),
    repositories.labels.listByBoard(board.id),
    repositories.checklist.listByCard(cardId),
    repositories.attachments.listByCard(cardId),
  ]);
  return {
    card,
    column,
    board,
    folderTitle: folder?.title ?? '',
    labels,
    boardLabels,
    checklist,
    attachments,
  };
}
