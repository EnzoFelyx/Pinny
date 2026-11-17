import type { Board, Column, Label } from '@/features/board/model/board.schema';
import type { BoardCard } from '@/features/board/model/boardData';
import type { Card } from '@/features/card/model/card.schema';

// Objetos de exemplo para os testes: só o campo que importa ao teste precisa ser informado.
const TIMESTAMP = '2026-05-01T12:00:00.000Z';

export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    columnId: 'column-1',
    title: 'Estudar para a prova',
    description: '',
    priority: null,
    dueAt: null,
    completedAt: null,
    archivedAt: null,
    position: 1,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    ...overrides,
  };
}

export function makeBoardCard(
  card: Partial<Card> = {},
  extras: Partial<Omit<BoardCard, 'card'>> = {},
): BoardCard {
  return { card: makeCard(card), labels: [], checklist: null, ...extras };
}

export function makeLabel(overrides: Partial<Label> = {}): Label {
  return {
    id: 'label-1',
    boardId: 'board-1',
    name: 'Estudos',
    color: 'lavender',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    ...overrides,
  };
}

export function makeColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: 'column-1',
    boardId: 'board-1',
    title: 'Pendentes',
    position: 1,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    ...overrides,
  };
}

export function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'board-1',
    folderId: 'folder-1',
    title: 'Semana',
    position: 1,
    pinnedAt: null,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    ...overrides,
  };
}
