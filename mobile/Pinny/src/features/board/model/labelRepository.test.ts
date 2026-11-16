import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;
let boardId: string;
let cardId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const { board, todo } = await seedBoard(repositories);
  boardId = board.id;
  cardId = (await repositories.cards.create({ columnId: todo.id, title: 'Estudar' })).id;
});

const namesOf = async (id: string) =>
  (await repositories.labels.listByCard(id)).map((label) => label.name);

describe('labelRepository', () => {
  test('lists the labels of the board by name', async () => {
    await repositories.labels.create(boardId, { name: 'Trabalho', color: 'peach' });
    await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });

    const names = (await repositories.labels.listByBoard(boardId)).map((label) => label.name);

    expect(names).toEqual(['Casa', 'Trabalho']);
  });

  test('updates the name and the color of a label', async () => {
    const label = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });

    await repositories.labels.update(label.id, { name: 'Lar', color: 'butter' });

    expect(await repositories.labels.listByBoard(boardId)).toMatchObject([
      { name: 'Lar', color: 'butter' },
    ]);
  });

  test('replaces all the labels of a card', async () => {
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    const work = await repositories.labels.create(boardId, { name: 'Trabalho', color: 'peach' });
    await repositories.labels.setForCard(cardId, [home.id]);

    await repositories.labels.setForCard(cardId, [work.id]);

    expect(await namesOf(cardId)).toEqual(['Trabalho']);
  });

  test('clears the labels of a card with an empty list', async () => {
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(cardId, [home.id]);

    await repositories.labels.setForCard(cardId, []);

    expect(await namesOf(cardId)).toEqual([]);
  });

  test('groups the labels of several cards in one query', async () => {
    const column = (await repositories.columns.listByBoard(boardId))[0];
    const other = await repositories.cards.create({ columnId: column.id, title: 'Mercado' });
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    const work = await repositories.labels.create(boardId, { name: 'Trabalho', color: 'peach' });
    await repositories.labels.setForCard(cardId, [work.id, home.id]);
    await repositories.labels.setForCard(other.id, [home.id]);

    const byCard = await repositories.labels.listByCards([cardId, other.id]);

    expect(byCard[cardId].map((label) => label.name)).toEqual(['Casa', 'Trabalho']);
    expect(byCard[other.id].map((label) => label.name)).toEqual(['Casa']);
    expect(await repositories.labels.listByCards([])).toEqual({});
  });

  test('removing a label takes it off the cards', async () => {
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(cardId, [home.id]);

    await repositories.labels.remove(home.id);

    expect(await namesOf(cardId)).toEqual([]);
  });

  test('restores removed labels exactly as they were', async () => {
    const home = await repositories.labels.create(boardId, { name: 'Casa', color: 'mint' });
    await repositories.labels.remove(home.id);

    await repositories.labels.restoreAll([home]);
    await repositories.labels.restoreAll([]);

    expect(await repositories.labels.listByBoard(boardId)).toEqual([home]);
  });
});
