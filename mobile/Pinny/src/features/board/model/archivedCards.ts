import { type CardRepository, cardRepository } from '@/features/card/model/cardRepository';
import {
  type ChecklistRepository,
  checklistRepository,
} from '@/features/card/model/checklistRepository';
import type { Card } from '@/features/card/model/card.schema';
import type { UndoOperation } from '@/features/history/model/actionHistory';

import type { Board, Column } from './board.schema';
import type { BoardCard } from './boardData';
import { moveCards } from './cardBatch';
import { type BoardRepository, boardRepository } from './boardRepository';
import { type ColumnRepository, columnRepository } from './columnRepository';
import { type LabelRepository, labelRepository } from './labelRepository';

export interface ArchivedCardsData {
  board: Board;
  // Colunas do quadro, em ordem ("Ordenar por coluna" e a primeira coluna do desarquivar).
  columns: Column[];
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

export interface UnarchiveResult {
  undo: UndoOperation;
  // Todos voltaram para a mesma coluna: o nome dela (para o aviso). null = colunas diferentes.
  columnTitle: string | null;
}

// Desarquivar: cada cartão volta ativo para o topo da coluna de onde saiu (decisão do autor), na
// ordem dada. A coluna sempre existe: apagar a coluna apaga os arquivados dela junto. Desfazer os
// arquiva de novo nas posições de antes. null = nenhum cartão existe mais.
export async function unarchiveCards(
  boardId: string,
  cardIds: readonly string[],
  repositories: Pick<ArchivedRepositories, 'columns' | 'cards' | 'labels'> = defaultRepositories,
): Promise<UnarchiveResult | null> {
  const found = await Promise.all(cardIds.map((id) => repositories.cards.getById(id)));
  const archived = found.filter((card): card is Card => card !== null);
  if (archived.length === 0) return null;
  const columnIds = [...new Set(archived.map((card) => card.columnId))];
  const operations: UndoOperation[] = archived.map((card) => ({
    kind: 'updateCard',
    cardId: card.id,
    previous: { archivedAt: card.archivedAt },
  }));
  for (const columnId of columnIds) {
    const ids = archived.filter((card) => card.columnId === columnId).map((card) => card.id);
    const [firstActive] = await repositories.cards.listByColumn(columnId);
    operations.push(
      await moveCards(
        ids,
        { columnId, toBoardId: null, nextId: firstActive?.id ?? null },
        repositories,
      ),
    );
  }
  for (const card of archived) await repositories.cards.update(card.id, { archivedAt: null });
  const [onlyColumnId] = columnIds;
  const onlyColumn =
    columnIds.length === 1
      ? (await repositories.columns.listByBoard(boardId)).find((c) => c.id === onlyColumnId)
      : undefined;
  return {
    undo: { kind: 'sequence', operations },
    columnTitle: onlyColumn?.title ?? null,
  };
}

export type ArchivedOrder = 'recent' | 'oldest' | 'byColumn';

export const ARCHIVED_ORDERS: readonly ArchivedOrder[] = ['recent', 'oldest', 'byColumn'];

export interface ArchivedGroup {
  // null = um grupo só com todos os cartões.
  column: Column | null;
  cards: BoardCard[];
}

// "Ordenar" da tela: os mais recentes ou os mais antigos primeiro (um grupo só), ou um grupo por
// coluna de origem, na ordem do quadro (recentes primeiro; coluna sem arquivados não aparece).
// cards chega do arquivado mais recente para o mais antigo.
export function groupArchived(
  cards: readonly BoardCard[],
  columns: readonly Column[],
  order: ArchivedOrder,
): ArchivedGroup[] {
  if (order === 'recent') return [{ column: null, cards: [...cards] }];
  if (order === 'oldest') return [{ column: null, cards: [...cards].reverse() }];
  return columns.flatMap((column) => {
    const inColumn = cards.filter((item) => item.card.columnId === column.id);
    return inColumn.length > 0 ? [{ column, cards: inColumn }] : [];
  });
}

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
    columns,
    cards: cards.map((card) => ({
      card,
      labels: labelsByCard[card.id] ?? [],
      checklist: progressByCard[card.id] ?? null,
    })),
  };
}
