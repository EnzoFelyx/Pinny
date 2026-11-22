import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;
let cardId: string;
let columnId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const { todo } = await seedBoard(repositories);
  columnId = todo.id;
  cardId = (await repositories.cards.create({ columnId, title: 'Viagem' })).id;
});

const photo = (name: string) => ({
  cardId,
  uri: `attachments/${name}.jpg`,
  thumbnailUri: `attachments/${name}-thumb.jpg`,
});

describe('attachmentRepository', () => {
  test('adds a photo without a caption and not as the cover', async () => {
    const created = await repositories.attachments.add(photo('a'));

    expect(created).toMatchObject({ ...photo('a'), caption: null, isCover: false });
    expect(await repositories.attachments.getById(created.id)).toEqual(created);
  });

  test('lists the photos of the card from the oldest to the newest', async () => {
    const created = await repositories.attachments.add(photo('a'));
    // Um anexo mais antigo, com a data do passado.
    await repositories.attachments.restore({
      ...created,
      id: 'older',
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    const ids = (await repositories.attachments.listByCard(cardId)).map((item) => item.id);

    expect(ids).toEqual(['older', created.id]);
  });

  test('removes a photo and restores it exactly as it was', async () => {
    const created = await repositories.attachments.add(photo('a'));

    await repositories.attachments.remove(created.id);
    const afterRemove = await repositories.attachments.getById(created.id);
    await repositories.attachments.restore(created);

    expect(afterRemove).toBeNull();
    expect(await repositories.attachments.getById(created.id)).toEqual(created);
  });

  test('photos leave together with the card', async () => {
    await repositories.attachments.add(photo('a'));

    await repositories.cards.remove(cardId);

    expect(await repositories.attachments.listByCard(cardId)).toEqual([]);
  });

  test('keeps a single cover per card', async () => {
    const first = await repositories.attachments.add(photo('a'));
    const second = await repositories.attachments.add(photo('b'));

    await repositories.attachments.setCover(cardId, first.id);
    await repositories.attachments.setCover(cardId, second.id);

    expect(await repositories.attachments.coverIdOf(cardId)).toBe(second.id);
    expect((await repositories.attachments.getById(first.id))?.isCover).toBe(false);
  });

  test('removes the cover', async () => {
    const created = await repositories.attachments.add(photo('a'));
    await repositories.attachments.setCover(cardId, created.id);

    await repositories.attachments.setCover(cardId, null);

    expect(await repositories.attachments.coverIdOf(cardId)).toBeNull();
  });

  test('lists the cover thumbnail of each card that has one', async () => {
    const other = (await repositories.cards.create({ columnId, title: 'Sem capa' })).id;
    const created = await repositories.attachments.add(photo('a'));
    await repositories.attachments.add({ ...photo('b'), cardId: other });
    await repositories.attachments.setCover(cardId, created.id);

    const covers = await repositories.attachments.coverThumbnailsByCards([cardId, other]);

    expect(covers).toEqual({ [cardId]: 'attachments/a-thumb.jpg' });
  });

  test('restores a former cover without the flag when the card already has another', async () => {
    const first = await repositories.attachments.add(photo('a'));
    const second = await repositories.attachments.add(photo('b'));
    await repositories.attachments.setCover(cardId, first.id);
    const removed = await repositories.attachments.getById(first.id);
    await repositories.attachments.remove(first.id);
    await repositories.attachments.setCover(cardId, second.id);

    if (removed) await repositories.attachments.restore(removed);

    expect(await repositories.attachments.coverIdOf(cardId)).toBe(second.id);
    expect((await repositories.attachments.getById(first.id))?.isCover).toBe(false);
  });
});
