import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import { duplicateColumn } from './columnCopy';
import { removeColumnWithCards, restoreColumnWithCards } from './columnRemoval';

let repositories: TestRepositories;
let boardId: string;
let todoId: string;
let doneId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const seed = await seedBoard(repositories);
  boardId = seed.board.id;
  todoId = seed.todo.id;
  doneId = seed.done.id;
});

const columnTitles = async () =>
  (await repositories.columns.listByBoard(boardId)).map((column) => column.title);

describe('removeColumnWithCards', () => {
  test('removes the column with active and archived cards and returns the snapshot', async () => {
    const [first] = await seedCards(repositories, todoId, ['A', 'B']);
    await repositories.cards.update(first, { archivedAt: '2026-05-18T12:00:00.000Z' });

    const snapshot = await removeColumnWithCards(todoId, repositories);

    expect(snapshot?.column.title).toBe('Pendentes');
    expect(snapshot?.cards.map((card) => card.card.title)).toEqual(['A', 'B']);
    expect(await columnTitles()).toEqual(['Concluídas']);
  });

  test('returns null when the column is already gone', async () => {
    expect(await removeColumnWithCards('missing', repositories)).toBeNull();
  });

  test('restoring the snapshot brings the column back in the same place', async () => {
    await seedCards(repositories, todoId, ['A', 'B']);
    const snapshot = await removeColumnWithCards(todoId, repositories);

    if (snapshot) await restoreColumnWithCards(snapshot, repositories);

    expect(await columnTitles()).toEqual(['Pendentes', 'Concluídas']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
  });
});

describe('duplicateColumn', () => {
  test('creates the copy right after the original, with copies of its cards', async () => {
    await seedCards(repositories, todoId, ['A', 'B']);
    const column = await repositories.columns.getById(todoId);
    if (!column) throw new Error('Coluna do teste não encontrada.');

    const copy = await duplicateColumn(column, 'Pendentes (cópia)', doneId, repositories);

    expect(await columnTitles()).toEqual(['Pendentes', 'Pendentes (cópia)', 'Concluídas']);
    expect(await titlesIn(repositories, copy.id)).toEqual(['A', 'B']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
  });

  test('puts the copy at the end when the original is the last column', async () => {
    const column = await repositories.columns.getById(doneId);
    if (!column) throw new Error('Coluna do teste não encontrada.');

    await duplicateColumn(column, 'Concluídas (cópia)', null, repositories);

    expect(await columnTitles()).toEqual(['Pendentes', 'Concluídas', 'Concluídas (cópia)']);
  });
});
