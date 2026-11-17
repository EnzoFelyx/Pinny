import { applyUndo } from '@/features/history/model/applyUndo';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import { archiveCards, moveCards, removeCards } from './cardBatch';

let repositories: TestRepositories;
let boardId: string;
let folderId: string;
let todoId: string;
let doneId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const seed = await seedBoard(repositories);
  folderId = seed.folder.id;
  boardId = seed.board.id;
  todoId = seed.todo.id;
  doneId = seed.done.id;
});

describe('archiveCards', () => {
  test('takes the cards off the board and undo brings them back to the same place', async () => {
    const [first, , third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

    const undo = await archiveCards([first, third], repositories.cards);
    const afterArchive = await titlesIn(repositories, todoId);
    await applyUndo(undo, repositories);

    expect(afterArchive).toEqual(['B']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B', 'C']);
  });

  test('is a single operation, not a sequence, for one card', async () => {
    const [first] = await seedCards(repositories, todoId, ['A']);

    const undo = await archiveCards([first], repositories.cards);

    expect(undo).toEqual({ kind: 'updateCard', cardId: first, previous: { archivedAt: null } });
  });
});

describe('removeCards', () => {
  test('deletes the cards and undo recreates them', async () => {
    const [first, second] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

    const undo = await removeCards([first, second], repositories.cards);
    const afterRemove = await titlesIn(repositories, todoId);
    await applyUndo(undo, repositories);

    expect(afterRemove).toEqual(['C']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B', 'C']);
  });
});

describe('moveCards', () => {
  test('moves the cards together to the end of the column, in the given order', async () => {
    const [first, , third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);
    await seedCards(repositories, doneId, ['X']);

    await moveCards([third, first], { columnId: doneId, toBoardId: null }, repositories);

    expect(await titlesIn(repositories, todoId)).toEqual(['B']);
    expect(await titlesIn(repositories, doneId)).toEqual(['X', 'C', 'A']);
  });

  test('moves the cards right before the given neighbor', async () => {
    const [first, , third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);
    const [, last] = await seedCards(repositories, doneId, ['X', 'Y']);

    await moveCards(
      [first, third],
      { columnId: doneId, toBoardId: null, nextId: last },
      repositories,
    );

    expect(await titlesIn(repositories, doneId)).toEqual(['X', 'A', 'C', 'Y']);
  });

  test('goes to the end when the neighbor is one of the moved cards', async () => {
    const [first, second] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

    await moveCards(
      [first, second],
      { columnId: todoId, toBoardId: null, nextId: second },
      repositories,
    );

    expect(await titlesIn(repositories, todoId)).toEqual(['C', 'A', 'B']);
  });

  test('undo returns each card to its column and position', async () => {
    const [first, , third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

    const undo = await moveCards(
      [first, third],
      { columnId: doneId, toBoardId: null },
      repositories,
    );
    await applyUndo(undo, repositories);

    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B', 'C']);
    expect(await titlesIn(repositories, doneId)).toEqual([]);
  });

  test('ignores cards that no longer exist', async () => {
    const [first] = await seedCards(repositories, todoId, ['A']);

    await moveCards(['missing', first], { columnId: doneId, toBoardId: null }, repositories);

    expect(await titlesIn(repositories, doneId)).toEqual(['A']);
  });

  describe('to another board', () => {
    let otherBoardId: string;
    let otherColumnId: string;

    beforeEach(async () => {
      otherBoardId = (await repositories.boards.create(folderId, 'Outro')).id;
      otherColumnId = (await repositories.columns.create(otherBoardId, 'Pendentes')).id;
    });

    const labelsOf = async (cardId: string) =>
      (await repositories.labels.listByCard(cardId)).map((label) => ({
        boardId: label.boardId,
        name: label.name,
      }));

    test('reuses the label of the destination with the same name and color', async () => {
      const [card] = await seedCards(repositories, todoId, ['A']);
      const label = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
      await repositories.labels.setForCard(card, [label.id]);
      await repositories.labels.create(otherBoardId, { name: 'Casa', color: 'mint' });

      await moveCards([card], { columnId: otherColumnId, toBoardId: otherBoardId }, repositories);

      expect(await labelsOf(card)).toEqual([{ boardId: otherBoardId, name: 'Casa' }]);
      expect(await repositories.labels.listByBoard(otherBoardId)).toHaveLength(1);
    });

    test('creates in the destination the labels it does not have yet', async () => {
      const [first, second] = await seedCards(repositories, todoId, ['A', 'B']);
      const label = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
      await repositories.labels.setForCard(first, [label.id]);
      await repositories.labels.setForCard(second, [label.id]);

      await moveCards(
        [first, second],
        { columnId: otherColumnId, toBoardId: otherBoardId },
        repositories,
      );

      // Uma etiqueta só para os dois cartões, não uma por cartão.
      expect(await repositories.labels.listByBoard(otherBoardId)).toMatchObject([
        { name: 'Casa', color: 'mint' },
      ]);
      expect(await labelsOf(second)).toEqual([{ boardId: otherBoardId, name: 'Casa' }]);
    });

    test('undo brings the card back with the labels of the original board', async () => {
      const [card] = await seedCards(repositories, todoId, ['A']);
      const label = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
      await repositories.labels.setForCard(card, [label.id]);

      const undo = await moveCards(
        [card],
        { columnId: otherColumnId, toBoardId: otherBoardId },
        repositories,
      );
      await applyUndo(undo, repositories);

      expect(await titlesIn(repositories, todoId)).toEqual(['A']);
      expect(await labelsOf(card)).toEqual([{ boardId, name: 'Casa' }]);
    });
  });
});
