import { createTestRepositories, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;
let folderId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  folderId = (await repositories.folders.create({ title: 'Pessoal' })).id;
});

const titlesIn = async (id: string) =>
  (await repositories.boards.listByFolder(id)).map((board) => board.title);

describe('boardRepository', () => {
  test('creates boards at the end of their folder', async () => {
    await repositories.boards.create(folderId, 'Semana');
    await repositories.boards.create(folderId, 'Estudos');

    expect(await titlesIn(folderId)).toEqual(['Semana', 'Estudos']);
  });

  test('lists only the boards of the folder', async () => {
    const other = await repositories.folders.create({ title: 'Trabalho' });
    await repositories.boards.create(folderId, 'Semana');
    await repositories.boards.create(other.id, 'Projeto');

    expect(await titlesIn(other.id)).toEqual(['Projeto']);
  });

  test('renames a board', async () => {
    const board = await repositories.boards.create(folderId, 'Semana');

    await repositories.boards.rename(board.id, 'Mês');

    expect((await repositories.boards.getById(board.id))?.title).toBe('Mês');
  });

  test('moves a board inside its folder', async () => {
    const first = await repositories.boards.create(folderId, 'A');
    await repositories.boards.create(folderId, 'B');
    const third = await repositories.boards.create(folderId, 'C');

    await repositories.boards.move(third.id, folderId, { nextId: first.id });

    expect(await titlesIn(folderId)).toEqual(['C', 'A', 'B']);
  });

  test('moves a board to the end of another folder', async () => {
    const other = await repositories.folders.create({ title: 'Trabalho' });
    await repositories.boards.create(other.id, 'Projeto');
    const board = await repositories.boards.create(folderId, 'Semana');

    await repositories.boards.move(board.id, other.id, {});

    expect(await titlesIn(folderId)).toEqual([]);
    expect(await titlesIn(other.id)).toEqual(['Projeto', 'Semana']);
  });

  test('puts a board back in an exact folder and position', async () => {
    const other = await repositories.folders.create({ title: 'Trabalho' });
    const board = await repositories.boards.create(folderId, 'Semana');

    await repositories.boards.moveToPosition(board.id, other.id, 7.5);

    expect(await repositories.boards.getById(board.id)).toMatchObject({
      folderId: other.id,
      position: 7.5,
    });
  });

  test('counts the pinned boards of each folder', async () => {
    const other = await repositories.folders.create({ title: 'Trabalho' });
    const pinned = await repositories.boards.create(folderId, 'Semana');
    await repositories.boards.create(folderId, 'Estudos');
    const elsewhere = await repositories.boards.create(other.id, 'Projeto');

    await repositories.boards.setPinnedAt(pinned.id, '2026-05-01T10:00:00.000Z');
    await repositories.boards.setPinnedAt(elsewhere.id, '2026-05-01T10:00:00.000Z');

    expect(await repositories.boards.countPinnedInFolder(folderId)).toBe(1);
  });

  test('removing a board removes its columns, cards and labels', async () => {
    const board = await repositories.boards.create(folderId, 'Semana');
    const column = await repositories.columns.create(board.id, 'Pendentes');
    const card = await repositories.cards.create({ columnId: column.id, title: 'Estudar' });
    await repositories.labels.create(board.id, { name: 'Estudos', color: 'mint' });

    await repositories.boards.remove(board.id);

    expect(await repositories.columns.getById(column.id)).toBeNull();
    expect(await repositories.cards.getById(card.id)).toBeNull();
    expect(await repositories.labels.listByBoard(board.id)).toEqual([]);
  });

  test('restores a removed board exactly as it was', async () => {
    const board = await repositories.boards.create(folderId, 'Semana');
    await repositories.boards.remove(board.id);

    await repositories.boards.restore(board);

    expect(await repositories.boards.getById(board.id)).toEqual(board);
  });
});
