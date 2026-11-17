import { makeBoard, makeBoardCard, makeColumn } from '@/test/factories';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
} from '@/test/testRepositories';

import {
  type BoardData,
  emptyColumnIdsOf,
  loadBoard,
  withBoardRenamed,
  withCardMoved,
  withCardsMoved,
  withColumnMoved,
  withColumnRemoved,
  withColumnRenamed,
} from './boardData';

// Quadro em memória: "todo" com a, b, c e "done" com x.
const data: BoardData = {
  board: makeBoard(),
  folderTitle: 'Pessoal',
  columns: [
    {
      column: makeColumn({ id: 'todo', title: 'Pendentes' }),
      cards: [
        makeBoardCard({ id: 'a', position: 1 }),
        makeBoardCard({ id: 'b', position: 2 }),
        makeBoardCard({ id: 'c', position: 3 }),
      ],
    },
    {
      column: makeColumn({ id: 'done', title: 'Concluídas' }),
      cards: [makeBoardCard({ id: 'x' })],
    },
    { column: makeColumn({ id: 'empty', title: 'Vazia' }), cards: [] },
  ],
};

const idsIn = (board: BoardData, columnId: string) =>
  board.columns.find((item) => item.column.id === columnId)?.cards.map((item) => item.card.id);
const columnIds = (board: BoardData) => board.columns.map((item) => item.column.id);

describe('loadBoard', () => {
  let repositories: TestRepositories;

  beforeEach(() => {
    repositories = createTestRepositories();
  });

  test('loads the columns in order, each with its active cards, labels and progress', async () => {
    const { board, todo } = await seedBoard(repositories);
    const [first, archived] = await seedCards(repositories, todo.id, ['A', 'Arquivado', 'B']);
    await repositories.cards.update(archived, { archivedAt: '2026-05-18T12:00:00.000Z' });
    const label = await repositories.labels.create(board.id, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(first, [label.id]);
    await repositories.checklist.add(first, 'Passo 1');

    const loaded = await loadBoard(board.id, repositories);

    expect(loaded?.folderTitle).toBe('Pessoal');
    expect(loaded?.columns.map((item) => item.column.title)).toEqual(['Pendentes', 'Concluídas']);
    expect(loaded?.columns[0].cards.map((item) => item.card.title)).toEqual(['A', 'B']);
    expect(loaded?.columns[0].cards[0]).toMatchObject({
      labels: [{ name: 'Casa' }],
      checklist: { done: 0, total: 1 },
    });
    expect(loaded?.columns[0].cards[1]).toMatchObject({ labels: [], checklist: null });
  });

  test('returns null for a board that does not exist', async () => {
    expect(await loadBoard('missing', repositories)).toBeNull();
  });
});

describe('emptyColumnIdsOf', () => {
  test('returns the columns without cards', () => {
    expect(emptyColumnIdsOf(data)).toEqual(['empty']);
    expect(emptyColumnIdsOf(null)).toEqual([]);
  });
});

describe('optimistic board updates', () => {
  test('renames a column without changing the original data', () => {
    const renamed = withColumnRenamed(data, 'todo', 'A fazer');

    expect(renamed.columns[0].column.title).toBe('A fazer');
    expect(data.columns[0].column.title).toBe('Pendentes');
  });

  test('renames the board', () => {
    expect(withBoardRenamed(data, 'Mês').board.title).toBe('Mês');
  });

  test('moves a column to a new index', () => {
    expect(columnIds(withColumnMoved(data, 'empty', 0))).toEqual(['empty', 'todo', 'done']);
  });

  test('returns the same data when the column to move does not exist', () => {
    expect(withColumnMoved(data, 'missing', 0)).toBe(data);
  });

  test('removes a column', () => {
    expect(columnIds(withColumnRemoved(data, 'done'))).toEqual(['todo', 'empty']);
  });
});

describe('withCardMoved', () => {
  test('moves a card inside its column', () => {
    const result = withCardMoved(data, 'a', 'todo', 2);

    expect(result?.orderedIds).toEqual(['b', 'c', 'a']);
    expect(result && idsIn(result.data, 'todo')).toEqual(['b', 'c', 'a']);
  });

  test('moves a card to another column, remembering where it was', () => {
    const result = withCardMoved(data, 'b', 'done', 0);

    expect(result && idsIn(result.data, 'todo')).toEqual(['a', 'c']);
    expect(result && idsIn(result.data, 'done')).toEqual(['b', 'x']);
    expect(result).toMatchObject({ previousColumnId: 'todo', previousPosition: 2 });
  });

  test('returns null when nothing changes', () => {
    expect(withCardMoved(data, 'a', 'todo', 0)).toBeNull();
    expect(withCardMoved(data, 'missing', 'todo', 0)).toBeNull();
    expect(withCardMoved(data, 'a', 'missing', 0)).toBeNull();
  });
});

describe('withCardsMoved', () => {
  test('moves the batch together, in the given order, to the slot of the target column', () => {
    const result = withCardsMoved(data, ['c', 'a'], 'done', 0);

    expect(result && idsIn(result.data, 'todo')).toEqual(['b']);
    expect(result && idsIn(result.data, 'done')).toEqual(['c', 'a', 'x']);
    expect(result?.nextId).toBe('x');
  });

  test('has no next card when the batch lands at the end', () => {
    const result = withCardsMoved(data, ['a'], 'done', 9);

    expect(result && idsIn(result.data, 'done')).toEqual(['x', 'a']);
    expect(result?.nextId).toBeNull();
  });

  test('counts the slot without the cards of the batch that are already in the column', () => {
    const result = withCardsMoved(data, ['a', 'x'], 'todo', 1);

    expect(result && idsIn(result.data, 'todo')).toEqual(['b', 'a', 'x', 'c']);
    expect(result && idsIn(result.data, 'done')).toEqual([]);
  });

  test('returns null when no card or the column does not exist', () => {
    expect(withCardsMoved(data, ['missing'], 'done', 0)).toBeNull();
    expect(withCardsMoved(data, ['a'], 'missing', 0)).toBeNull();
  });
});
