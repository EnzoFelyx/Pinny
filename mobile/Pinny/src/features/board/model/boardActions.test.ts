import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import { makeBoard } from '@/test/factories';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import type { Board } from './board.schema';
import { duplicateBoard } from './boardCopy';
import { createBoardWithColumns } from './boardCreation';
import { moveBoardToFolder, restoreBoardPlace } from './boardMove';
import {
  orderForPreview,
  pinBoards,
  selectionPinAction,
  togglePinnedBoard,
  unpinBoards,
} from './boardPinning';
import { removeBoardWithContent, restoreBoardWithContent } from './boardRemoval';

let repositories: TestRepositories;
let folderId: string;
let board: Board;
let todoId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const seed = await seedBoard(repositories);
  folderId = seed.folder.id;
  board = seed.board;
  todoId = seed.todo.id;
});

const boardTitles = async (id: string) =>
  (await repositories.boards.listByFolder(id)).map((item) => item.title);
const columnTitles = async (id: string) =>
  (await repositories.columns.listByBoard(id)).map((column) => column.title);
const PINNED_AT = '2026-05-01T10:00:00.000Z';

// Enche a pasta com o máximo de quadros fixados.
async function fillPins(inFolderId: string) {
  for (let index = 0; index < PINNED_BOARDS_PER_FOLDER; index += 1) {
    const pinned = await repositories.boards.create(inFolderId, `Fixado ${index + 1}`);
    await repositories.boards.setPinnedAt(pinned.id, PINNED_AT);
  }
}

describe('createBoardWithColumns', () => {
  test('creates the board at the end of the folder with the starting columns in order', async () => {
    const created = await createBoardWithColumns(
      folderId,
      'Estudos',
      ['Pendentes', 'Concluídas'],
      repositories,
    );

    expect(await boardTitles(folderId)).toEqual(['Semana', 'Estudos']);
    expect(await columnTitles(created.id)).toEqual(['Pendentes', 'Concluídas']);
  });
});

describe('removeBoardWithContent', () => {
  test('removes the board with everything and restoring brings it all back', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A', 'B']);
    const label = await repositories.labels.create(board.id, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(cardId, [label.id]);

    const snapshot = await removeBoardWithContent(board.id, repositories);
    const afterRemove = await boardTitles(folderId);
    if (snapshot) await restoreBoardWithContent(snapshot, repositories);

    expect(afterRemove).toEqual([]);
    expect(await repositories.boards.getById(board.id)).toEqual(board);
    expect(await columnTitles(board.id)).toEqual(['Pendentes', 'Concluídas']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
    expect((await repositories.labels.listByCard(cardId)).map((item) => item.name)).toEqual([
      'Casa',
    ]);
  });

  test('returns null when the board is already gone', async () => {
    expect(await removeBoardWithContent('missing', repositories)).toBeNull();
  });
});

describe('duplicateBoard', () => {
  test('creates an unpinned copy right after the original, with its own labels', async () => {
    await repositories.boards.create(folderId, 'Estudos');
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    const label = await repositories.labels.create(board.id, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(cardId, [label.id]);

    const copy = await duplicateBoard(board, 'Semana (cópia)', repositories);

    const [copyColumn] = await repositories.columns.listByBoard(copy.id);
    const [copyCard] = await repositories.cards.listByColumn(copyColumn.id);
    const [copyLabel] = await repositories.labels.listByCard(copyCard.id);
    expect(await boardTitles(folderId)).toEqual(['Semana', 'Semana (cópia)', 'Estudos']);
    expect(copy.pinnedAt).toBeNull();
    expect(await columnTitles(copy.id)).toEqual(['Pendentes', 'Concluídas']);
    expect(copyCard.title).toBe('A');
    expect(copyLabel).toMatchObject({ boardId: copy.id, name: 'Casa', color: 'mint' });
  });
});

describe('moveBoardToFolder', () => {
  let otherFolderId: string;

  beforeEach(async () => {
    otherFolderId = (await repositories.folders.create({ title: 'Trabalho' })).id;
  });

  test('moves the board to the end of the chosen folder', async () => {
    await repositories.boards.create(otherFolderId, 'Projeto');

    await moveBoardToFolder(board.id, otherFolderId, repositories.boards);

    expect(await boardTitles(folderId)).toEqual([]);
    expect(await boardTitles(otherFolderId)).toEqual(['Projeto', 'Semana']);
  });

  test('keeps the board pinned when the destination has room', async () => {
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);

    await moveBoardToFolder(board.id, otherFolderId, repositories.boards);

    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBe(PINNED_AT);
  });

  test('unpins the board when the destination is already full of pinned boards', async () => {
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);
    await fillPins(otherFolderId);

    await moveBoardToFolder(board.id, otherFolderId, repositories.boards);

    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBeNull();
  });

  test('returns null when the board is already gone', async () => {
    expect(await moveBoardToFolder('missing', otherFolderId, repositories.boards)).toBeNull();
  });

  test('restoring the place brings back the folder, the position and the pin', async () => {
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);
    await repositories.boards.create(folderId, 'Estudos');
    const place = await moveBoardToFolder(board.id, otherFolderId, repositories.boards);

    const redo = place ? await restoreBoardPlace(place, repositories.boards) : null;

    expect(await boardTitles(folderId)).toEqual(['Semana', 'Estudos']);
    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBe(PINNED_AT);
    expect(redo).toMatchObject({ boardId: board.id, folderId: otherFolderId });
  });
});

describe('togglePinnedBoard', () => {
  test('pins a board and unpins it on the next toggle', async () => {
    const first = await togglePinnedBoard(board.id, repositories.boards);
    const pinnedAt = (await repositories.boards.getById(board.id))?.pinnedAt;
    const second = await togglePinnedBoard(board.id, repositories.boards);

    expect(first).toBe('pinned');
    expect(pinnedAt).not.toBeNull();
    expect(second).toBe('unpinned');
    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBeNull();
  });

  test('does not pin beyond the limit of the folder', async () => {
    await fillPins(folderId);

    const result = await togglePinnedBoard(board.id, repositories.boards);

    expect(result).toBe('limitReached');
    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBeNull();
  });

  test('reports a board that does not exist', async () => {
    expect(await togglePinnedBoard('missing', repositories.boards)).toBe('notFound');
  });
});

describe('pinBoards and unpinBoards', () => {
  test('pins in the chosen order: the first chosen shows first on Home', async () => {
    const second = await repositories.boards.create(folderId, 'Estudos');
    const third = await repositories.boards.create(folderId, 'Viagem');
    const folderBoards = await repositories.boards.listByFolder(folderId);

    await pinBoards(folderBoards, [third.id, board.id], repositories.boards);

    const preview = orderForPreview(await repositories.boards.listByFolder(folderId));
    expect(preview.map((item) => item.title)).toEqual(['Viagem', 'Semana', 'Estudos']);
    expect((await repositories.boards.getById(second.id))?.pinnedAt).toBeNull();
  });

  test('keeps the date of a board that was already pinned', async () => {
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);
    const folderBoards = await repositories.boards.listByFolder(folderId);

    await pinBoards(folderBoards, [board.id], repositories.boards);

    expect((await repositories.boards.getById(board.id))?.pinnedAt).toBe(PINNED_AT);
  });

  test('unpins the given boards', async () => {
    await repositories.boards.setPinnedAt(board.id, PINNED_AT);

    await unpinBoards([board.id], repositories.boards);

    expect(await repositories.boards.countPinnedInFolder(folderId)).toBe(0);
  });
});

describe('orderForPreview', () => {
  test('shows pinned boards first, most recent on top, then the others in folder order', () => {
    const boards = [
      makeBoard({ id: 'a' }),
      makeBoard({ id: 'b', pinnedAt: '2026-05-01T10:00:00.000Z' }),
      makeBoard({ id: 'c' }),
      makeBoard({ id: 'd', pinnedAt: '2026-05-02T10:00:00.000Z' }),
    ];

    expect(orderForPreview(boards).map((item) => item.id)).toEqual(['d', 'b', 'a', 'c']);
  });
});

describe('selectionPinAction', () => {
  const folderBoards = [
    makeBoard({ id: 'pinned-1', pinnedAt: PINNED_AT }),
    makeBoard({ id: 'pinned-2', pinnedAt: PINNED_AT }),
    makeBoard({ id: 'free-1' }),
    makeBoard({ id: 'free-2' }),
  ];

  test('offers to unpin when every chosen board is pinned', () => {
    expect(selectionPinAction(folderBoards, ['pinned-1', 'pinned-2'])).toEqual({
      kind: 'unpin',
      isEnabled: true,
      isLimitReached: false,
    });
  });

  test('offers to pin while the folder stays inside the limit', () => {
    expect(selectionPinAction(folderBoards, ['free-1'])).toEqual({
      kind: 'pin',
      isEnabled: true,
      isLimitReached: false,
    });
  });

  test('blocks pinning when it would go over the limit, counting the pinned ones', () => {
    expect(selectionPinAction(folderBoards, ['free-1', 'free-2'])).toEqual({
      kind: 'pin',
      isEnabled: false,
      isLimitReached: true,
    });
  });

  test('is disabled with nothing selected', () => {
    expect(selectionPinAction(folderBoards, [])).toEqual({
      kind: 'pin',
      isEnabled: false,
      isLimitReached: false,
    });
  });
});
