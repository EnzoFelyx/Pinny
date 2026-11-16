import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;
let cardId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const { todo } = await seedBoard(repositories);
  cardId = (await repositories.cards.create({ columnId: todo.id, title: 'Viagem' })).id;
});

const texts = async () =>
  (await repositories.checklist.listByCard(cardId)).map((item) => item.text);

describe('checklistRepository', () => {
  test('adds items not done, at the end of the checklist', async () => {
    await repositories.checklist.add(cardId, 'Passagens');
    const second = await repositories.checklist.add(cardId, 'Hotel');

    expect(second.isDone).toBe(false);
    expect(await texts()).toEqual(['Passagens', 'Hotel']);
  });

  test('renames an item', async () => {
    const item = await repositories.checklist.add(cardId, 'Hotel');

    await repositories.checklist.rename(item.id, 'Pousada');

    expect(await texts()).toEqual(['Pousada']);
  });

  test('reports how many items are done for each card', async () => {
    const first = await repositories.checklist.add(cardId, 'Passagens');
    await repositories.checklist.add(cardId, 'Hotel');
    await repositories.checklist.add(cardId, 'Malas');

    await repositories.checklist.setDone(first.id, true);

    expect(await repositories.checklist.progressByCards([cardId])).toEqual({
      [cardId]: { done: 1, total: 3 },
    });
  });

  test('leaves cards without a checklist out of the progress', async () => {
    expect(await repositories.checklist.progressByCards([cardId])).toEqual({});
    expect(await repositories.checklist.progressByCards([])).toEqual({});
  });

  test('marks and unmarks every item of the card at once', async () => {
    await repositories.checklist.add(cardId, 'Passagens');
    await repositories.checklist.add(cardId, 'Hotel');

    await repositories.checklist.setAllDone(cardId, true);
    const allDone = await repositories.checklist.progressByCards([cardId]);
    await repositories.checklist.setAllDone(cardId, false);
    const noneDone = await repositories.checklist.progressByCards([cardId]);

    expect(allDone[cardId]).toEqual({ done: 2, total: 2 });
    expect(noneDone[cardId]).toEqual({ done: 0, total: 2 });
  });

  test('moves an item before another one', async () => {
    const first = await repositories.checklist.add(cardId, 'Passagens');
    const second = await repositories.checklist.add(cardId, 'Hotel');

    await repositories.checklist.move(second.id, { nextId: first.id });

    expect(await texts()).toEqual(['Hotel', 'Passagens']);
  });

  test('fails to move an item that does not exist', async () => {
    await expect(repositories.checklist.move('missing', {})).rejects.toThrow('missing');
  });

  test('removes an item', async () => {
    const item = await repositories.checklist.add(cardId, 'Hotel');

    await repositories.checklist.remove(item.id);

    expect(await texts()).toEqual([]);
  });
});
