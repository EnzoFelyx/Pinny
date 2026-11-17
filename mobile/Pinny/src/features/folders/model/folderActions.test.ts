import { PINNED_FOLDERS_LIMIT } from '@/constants/limits';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import { togglePinnedFolder } from './folderPinning';
import { removeFolderWithContent, restoreFolderWithContent } from './folderRemoval';
import { filterFoldersByQuery, loadFoldersWithBoards } from './homeData';

let repositories: TestRepositories;

beforeEach(() => {
  repositories = createTestRepositories();
});

const PINNED_AT = '2026-05-01T10:00:00.000Z';

async function fillPinnedFolders() {
  for (let index = 0; index < PINNED_FOLDERS_LIMIT; index += 1) {
    const folder = await repositories.folders.create({ title: `Fixada ${index + 1}` });
    await repositories.folders.setPinnedAt(folder.id, PINNED_AT);
  }
}

describe('togglePinnedFolder', () => {
  test('pins a folder and unpins it on the next toggle', async () => {
    const folder = await repositories.folders.create({ title: 'Pessoal' });

    const first = await togglePinnedFolder(folder.id, repositories.folders);
    const second = await togglePinnedFolder(folder.id, repositories.folders);

    expect([first, second]).toEqual(['pinned', 'unpinned']);
    expect(await repositories.folders.countPinned()).toBe(0);
  });

  test('does not pin beyond the limit', async () => {
    await fillPinnedFolders();
    const folder = await repositories.folders.create({ title: 'Pessoal' });

    const result = await togglePinnedFolder(folder.id, repositories.folders);

    expect(result).toBe('limitReached');
    expect(await repositories.folders.countPinned()).toBe(PINNED_FOLDERS_LIMIT);
  });

  test('reports a folder that does not exist', async () => {
    expect(await togglePinnedFolder('missing', repositories.folders)).toBe('notFound');
  });
});

describe('removeFolderWithContent', () => {
  test('removes the folder with its boards and restoring brings everything back', async () => {
    const { folder, board, todo } = await seedBoard(repositories);
    await seedCards(repositories, todo.id, ['A', 'B']);

    const snapshot = await removeFolderWithContent(folder.id, repositories);
    const afterRemove = await repositories.folders.list();
    if (snapshot) await restoreFolderWithContent(snapshot, repositories);

    expect(afterRemove).toEqual([]);
    expect(await repositories.folders.getById(folder.id)).toEqual(folder);
    expect(await repositories.boards.getById(board.id)).toEqual(board);
    expect(await titlesIn(repositories, todo.id)).toEqual(['A', 'B']);
  });

  test('returns null when the folder is already gone', async () => {
    expect(await removeFolderWithContent('missing', repositories)).toBeNull();
  });

  test('a pinned folder comes back unpinned when Home is already full of pinned ones', async () => {
    const folder = await repositories.folders.create({ title: 'Pessoal' });
    await repositories.folders.setPinnedAt(folder.id, PINNED_AT);
    const snapshot = await removeFolderWithContent(folder.id, repositories);
    await fillPinnedFolders();

    if (snapshot) await restoreFolderWithContent(snapshot, repositories);

    expect((await repositories.folders.getById(folder.id))?.pinnedAt).toBeNull();
  });

  test('a pinned folder comes back pinned when there is still room', async () => {
    const folder = await repositories.folders.create({ title: 'Pessoal' });
    await repositories.folders.setPinnedAt(folder.id, PINNED_AT);
    const snapshot = await removeFolderWithContent(folder.id, repositories);

    if (snapshot) await restoreFolderWithContent(snapshot, repositories);

    expect((await repositories.folders.getById(folder.id))?.pinnedAt).toBe(PINNED_AT);
  });
});

describe('home data', () => {
  async function seedHome() {
    const personal = await repositories.folders.create({ title: 'Pessoal' });
    const work = await repositories.folders.create({ title: 'Trabalho' });
    await repositories.boards.create(personal.id, 'Viagem de férias');
    await repositories.boards.create(personal.id, 'Estúdio');
    await repositories.boards.create(work.id, 'Projeto');
    return loadFoldersWithBoards(repositories);
  }

  const summary = (items: Awaited<ReturnType<typeof seedHome>>) =>
    items.map((item) => [item.folder.title, item.boards.map((board) => board.title)]);

  test('loads each folder with its boards, in order', async () => {
    expect(summary(await seedHome())).toEqual([
      ['Pessoal', ['Viagem de férias', 'Estúdio']],
      ['Trabalho', ['Projeto']],
    ]);
  });

  test('a folder whose name matches the search shows all its boards', async () => {
    const result = filterFoldersByQuery(await seedHome(), 'pessoal');

    expect(summary(result)).toEqual([['Pessoal', ['Viagem de férias', 'Estúdio']]]);
  });

  test('a folder shows only the boards that match, ignoring accents', async () => {
    const result = filterFoldersByQuery(await seedHome(), 'estudio');

    expect(summary(result)).toEqual([['Pessoal', ['Estúdio']]]);
  });

  test('an empty search shows everything and an unknown term shows nothing', async () => {
    const items = await seedHome();

    expect(filterFoldersByQuery(items, '  ')).toEqual(items);
    expect(filterFoldersByQuery(items, 'mercado')).toEqual([]);
  });
});
