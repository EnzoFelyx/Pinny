import { applyUndo } from '@/features/history/model/applyUndo';
import { makeBoardCard, makeColumn } from '@/test/factories';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import { groupArchived, loadArchivedCards, unarchiveCards } from './archivedCards';

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

const archive = (cardId: string, hour: number) =>
  repositories.cards.update(cardId, { archivedAt: `2026-05-18T${hour}:00:00.000Z` });
const archivedTitles = async () =>
  (await loadArchivedCards(boardId, repositories))?.cards.map((item) => item.card.title);

describe('loadArchivedCards', () => {
  test('lists the archived cards of every column, the most recent first', async () => {
    const [first] = await seedCards(repositories, todoId, ['A', 'B']);
    const [other] = await seedCards(repositories, doneId, ['X']);
    await archive(first, 10);
    await archive(other, 12);

    const loaded = await loadArchivedCards(boardId, repositories);

    expect(loaded?.cards.map((item) => item.card.title)).toEqual(['X', 'A']);
    expect(loaded?.columns.map((column) => column.title)).toEqual(['Pendentes', 'Concluídas']);
  });

  test('returns null for a board that does not exist', async () => {
    expect(await loadArchivedCards('missing', repositories)).toBeNull();
  });
});

describe('unarchiveCards', () => {
  test('returns the cards to the top of their column, in the given order', async () => {
    const [, second, third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);
    await archive(second, 10);
    await archive(third, 11);

    const result = await unarchiveCards(boardId, [third, second], repositories);

    expect(await titlesIn(repositories, todoId)).toEqual(['C', 'B', 'A']);
    expect(result?.columnTitle).toBe('Pendentes');
    expect(await archivedTitles()).toEqual([]);
  });

  test('sends each card back to the column it came from', async () => {
    const [first] = await seedCards(repositories, todoId, ['A']);
    const [other] = await seedCards(repositories, doneId, ['X', 'Y']);
    await archive(first, 10);
    await archive(other, 11);

    const result = await unarchiveCards(boardId, [first, other], repositories);

    expect(await titlesIn(repositories, todoId)).toEqual(['A']);
    expect(await titlesIn(repositories, doneId)).toEqual(['X', 'Y']);
    // Colunas diferentes: o aviso não cita uma coluna.
    expect(result?.columnTitle).toBeNull();
  });

  test('undo archives the cards again', async () => {
    const [, second] = await seedCards(repositories, todoId, ['A', 'B']);
    await archive(second, 10);
    const result = await unarchiveCards(boardId, [second], repositories);

    if (result) await applyUndo(result.undo, repositories);

    expect(await titlesIn(repositories, todoId)).toEqual(['A']);
    expect(await archivedTitles()).toEqual(['B']);
  });

  test('returns null when none of the cards exist anymore', async () => {
    expect(await unarchiveCards(boardId, ['missing'], repositories)).toBeNull();
  });
});

describe('groupArchived', () => {
  const columns = [makeColumn({ id: 'todo' }), makeColumn({ id: 'done' }), makeColumn({ id: 'x' })];
  // Do arquivado mais recente para o mais antigo, como chega do banco.
  const cards = [
    makeBoardCard({ id: 'newest', columnId: 'done' }),
    makeBoardCard({ id: 'middle', columnId: 'todo' }),
    makeBoardCard({ id: 'oldest', columnId: 'done' }),
  ];
  const ids = (groups: ReturnType<typeof groupArchived>) =>
    groups.map((group) => [group.column.id, group.cards.map((item) => item.card.id)]);

  test('groups by origin column in board order, skipping columns without archived cards', () => {
    expect(ids(groupArchived(cards, columns, 'recent'))).toEqual([
      ['todo', ['middle']],
      ['done', ['newest', 'oldest']],
    ]);
  });

  test('puts the oldest first inside each section when asked', () => {
    expect(ids(groupArchived(cards, columns, 'oldest'))).toEqual([
      ['todo', ['middle']],
      ['done', ['oldest', 'newest']],
    ]);
  });
});
