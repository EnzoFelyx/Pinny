import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import type { UndoOperation } from './actionHistory';
import { applyUndo } from './applyUndo';

let repositories: TestRepositories;
let folderId: string;
let boardId: string;
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

// Aplica a operação e, em seguida, a inversa que ela devolveu (desfazer e refazer).
async function applyAndInvert(operation: UndoOperation) {
  const inverse = await applyUndo(operation, repositories);
  if (!inverse) throw new Error('A operação não devolveu a inversa.');
  return { inverse, revert: () => applyUndo(inverse, repositories) };
}

const columnTitles = async () =>
  (await repositories.columns.listByBoard(boardId)).map((column) => column.title);

describe('applyUndo', () => {
  test('deleteCard removes the card and its inverse recreates it', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);

    const { revert } = await applyAndInvert({ kind: 'deleteCard', cardId });
    const afterDelete = await titlesIn(repositories, todoId);
    await revert();

    expect(afterDelete).toEqual([]);
    expect(await titlesIn(repositories, todoId)).toEqual(['A']);
  });

  test('moveCard puts the card back and its inverse moves it again', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    const original = await repositories.cards.getById(cardId);
    await repositories.cards.move(cardId, doneId, {});

    const { revert } = await applyAndInvert({
      kind: 'moveCard',
      cardId,
      columnId: todoId,
      position: original?.position ?? 0,
    });
    const afterUndo = await titlesIn(repositories, todoId);
    await revert();

    expect(afterUndo).toEqual(['A']);
    expect(await titlesIn(repositories, doneId)).toEqual(['A']);
  });

  test('updateCard writes the previous values and its inverse writes the new ones back', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['Novo título']);

    const { inverse, revert } = await applyAndInvert({
      kind: 'updateCard',
      cardId,
      previous: { title: 'Título antigo' },
    });
    const afterUndo = (await repositories.cards.getById(cardId))?.title;
    await revert();

    expect(afterUndo).toBe('Título antigo');
    expect(inverse).toEqual({ kind: 'updateCard', cardId, previous: { title: 'Novo título' } });
    expect((await repositories.cards.getById(cardId))?.title).toBe('Novo título');
  });

  test('setCardLabels brings back the labels the card had', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    const work = await repositories.labels.create(boardId, { name: 'Trabalho', color: 'peach' });
    await repositories.labels.setForCard(cardId, [work.id]);

    const inverse = await applyUndo(
      { kind: 'setCardLabels', cardId, labelIds: [home.id] },
      repositories,
    );

    expect((await repositories.labels.listByCard(cardId)).map((l) => l.name)).toEqual(['Casa']);
    expect(inverse).toEqual({ kind: 'setCardLabels', cardId, labelIds: [work.id] });
  });

  test('deleteColumn removes the column and its inverse recreates it with the cards', async () => {
    await seedCards(repositories, todoId, ['A', 'B']);

    const { revert } = await applyAndInvert({ kind: 'deleteColumn', columnId: todoId });
    const afterDelete = await columnTitles();
    await revert();

    expect(afterDelete).toEqual(['Concluídas']);
    expect(await columnTitles()).toEqual(['Pendentes', 'Concluídas']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
  });

  test('moveColumn returns the column to its position', async () => {
    const original = await repositories.columns.getById(doneId);
    await repositories.columns.move(doneId, { nextId: todoId });

    const { revert } = await applyAndInvert({
      kind: 'moveColumn',
      columnId: doneId,
      position: original?.position ?? 0,
    });
    const afterUndo = await columnTitles();
    await revert();

    expect(afterUndo).toEqual(['Pendentes', 'Concluídas']);
    expect(await columnTitles()).toEqual(['Concluídas', 'Pendentes']);
  });

  test('renameColumn and renameBoard bring back the previous names', async () => {
    const columnInverse = await applyUndo(
      { kind: 'renameColumn', columnId: todoId, title: 'A fazer' },
      repositories,
    );
    const boardInverse = await applyUndo(
      { kind: 'renameBoard', boardId, title: 'Mês' },
      repositories,
    );

    expect(await columnTitles()).toEqual(['A fazer', 'Concluídas']);
    expect((await repositories.boards.getById(boardId))?.title).toBe('Mês');
    expect(columnInverse).toEqual({ kind: 'renameColumn', columnId: todoId, title: 'Pendentes' });
    expect(boardInverse).toEqual({ kind: 'renameBoard', boardId, title: 'Semana' });
  });

  test('deleteBoard and deleteFolder remove everything and their inverses bring it back', async () => {
    await seedCards(repositories, todoId, ['A']);

    const board = await applyAndInvert({ kind: 'deleteBoard', boardId });
    const boardsAfterDelete = await repositories.boards.listByFolder(folderId);
    await board.revert();
    const folder = await applyAndInvert({ kind: 'deleteFolder', folderId });
    const foldersAfterDelete = await repositories.folders.list();
    await folder.revert();

    expect(boardsAfterDelete).toEqual([]);
    expect(foldersAfterDelete).toEqual([]);
    expect(await titlesIn(repositories, todoId)).toEqual(['A']);
  });

  test('moveBoard returns the board to its folder', async () => {
    const other = await repositories.folders.create({ title: 'Trabalho' });
    const before = await repositories.boards.getById(boardId);
    await repositories.boards.move(boardId, other.id, {});

    await applyUndo(
      {
        kind: 'moveBoard',
        place: { boardId, folderId, position: before?.position ?? 0, pinnedAt: null },
      },
      repositories,
    );

    expect((await repositories.boards.getById(boardId))?.folderId).toBe(folderId);
  });

  test('a sequence applies every step and its inverse redoes them in reverse order', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    const original = await repositories.cards.getById(cardId);
    const newColumn = await repositories.columns.create(boardId, 'Nova');
    await repositories.cards.move(cardId, newColumn.id, {});

    // Desfaz "criar a coluna com este cartão": devolve o cartão e apaga a coluna.
    const { inverse, revert } = await applyAndInvert({
      kind: 'sequence',
      operations: [
        { kind: 'moveCard', cardId, columnId: todoId, position: original?.position ?? 0 },
        { kind: 'deleteColumn', columnId: newColumn.id },
      ],
    });
    const afterUndo = await columnTitles();
    await revert();

    expect(afterUndo).toEqual(['Pendentes', 'Concluídas']);
    expect(inverse).toMatchObject({
      kind: 'sequence',
      operations: [{ kind: 'restoreColumn' }, { kind: 'moveCard' }],
    });
    expect(await titlesIn(repositories, newColumn.id)).toEqual(['A']);
  });

  test('returns null when the target no longer exists', async () => {
    const operations: UndoOperation[] = [
      { kind: 'deleteColumn', columnId: 'missing' },
      { kind: 'moveColumn', columnId: 'missing', position: 1 },
      { kind: 'renameColumn', columnId: 'missing', title: 'X' },
      { kind: 'renameBoard', boardId: 'missing', title: 'X' },
      { kind: 'deleteBoard', boardId: 'missing' },
      { kind: 'deleteFolder', folderId: 'missing' },
      { kind: 'moveCard', cardId: 'missing', columnId: todoId, position: 1 },
      { kind: 'updateCard', cardId: 'missing', previous: { title: 'X' } },
    ];

    const results = await Promise.all(
      operations.map((operation) => applyUndo(operation, repositories)),
    );

    expect(results).toEqual(operations.map(() => null));
  });
});
