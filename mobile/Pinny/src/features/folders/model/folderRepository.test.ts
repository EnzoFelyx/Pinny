import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;

beforeEach(() => {
  repositories = createTestRepositories();
});

const titles = async () => (await repositories.folders.list()).map((folder) => folder.title);

describe('folderRepository', () => {
  test('creates a folder with the default icon and color at the end of the list', async () => {
    await repositories.folders.create({ title: 'Pessoal' });

    const created = await repositories.folders.create({ title: 'Trabalho' });

    expect(created).toMatchObject({ icon: 'folder', color: 'lavender', pinnedAt: null });
    expect(await titles()).toEqual(['Pessoal', 'Trabalho']);
  });

  test('keeps the chosen icon and color', async () => {
    const created = await repositories.folders.create({
      title: 'Viagem',
      icon: 'plane',
      color: 'mint',
    });

    expect(await repositories.folders.getById(created.id)).toMatchObject({
      icon: 'plane',
      color: 'mint',
    });
  });

  test('returns null for a folder that does not exist', async () => {
    expect(await repositories.folders.getById('missing')).toBeNull();
  });

  test('renames a folder', async () => {
    const folder = await repositories.folders.create({ title: 'Pessoal' });

    await repositories.folders.rename(folder.id, 'Casa');

    expect(await titles()).toEqual(['Casa']);
  });

  test('moves a folder between two others', async () => {
    const first = await repositories.folders.create({ title: 'A' });
    const second = await repositories.folders.create({ title: 'B' });
    const third = await repositories.folders.create({ title: 'C' });

    await repositories.folders.move(third.id, { previousId: first.id, nextId: second.id });

    expect(await titles()).toEqual(['A', 'C', 'B']);
  });

  test('lists pinned folders first, the most recently pinned on top', async () => {
    await repositories.folders.create({ title: 'A' });
    const second = await repositories.folders.create({ title: 'B' });
    const third = await repositories.folders.create({ title: 'C' });

    await repositories.folders.setPinnedAt(second.id, '2026-05-01T10:00:00.000Z');
    await repositories.folders.setPinnedAt(third.id, '2026-05-02T10:00:00.000Z');

    expect(await titles()).toEqual(['C', 'B', 'A']);
    expect(await repositories.folders.countPinned()).toBe(2);
  });

  test('unpins a folder', async () => {
    const folder = await repositories.folders.create({ title: 'A' });
    await repositories.folders.setPinnedAt(folder.id, '2026-05-01T10:00:00.000Z');

    await repositories.folders.setPinnedAt(folder.id, null);

    expect(await repositories.folders.countPinned()).toBe(0);
  });

  test('removing a folder removes its boards, columns and cards', async () => {
    const { folder, board, todo } = await seedBoard(repositories);
    const card = await repositories.cards.create({ columnId: todo.id, title: 'Estudar' });

    await repositories.folders.remove(folder.id);

    expect(await repositories.folders.list()).toEqual([]);
    expect(await repositories.boards.getById(board.id)).toBeNull();
    expect(await repositories.columns.getById(todo.id)).toBeNull();
    expect(await repositories.cards.getById(card.id)).toBeNull();
  });

  test('restores a removed folder exactly as it was', async () => {
    const folder = await repositories.folders.create({ title: 'Pessoal', color: 'peach' });
    await repositories.folders.remove(folder.id);

    await repositories.folders.restore(folder);

    expect(await repositories.folders.getById(folder.id)).toEqual(folder);
  });
});
