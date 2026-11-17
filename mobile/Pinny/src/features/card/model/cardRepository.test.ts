import { MIN_POSITION_GAP } from '@/utils/position';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

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

// Cartão "Viagem" com uma etiqueta e duas subtarefas (a primeira feita).
async function seedFullCard() {
  const card = await repositories.cards.create({ columnId: todoId, title: 'Viagem' });
  const label = await repositories.labels.create(boardId, { name: 'Lazer', color: 'mint' });
  await repositories.labels.setForCard(card.id, [label.id]);
  const tickets = await repositories.checklist.add(card.id, 'Passagens');
  await repositories.checklist.add(card.id, 'Hotel');
  await repositories.checklist.setDone(tickets.id, true);
  return { card, label };
}

describe('cardRepository', () => {
  test('creates a card with empty optional fields at the end of the column', async () => {
    await repositories.cards.create({ columnId: todoId, title: 'Estudar' });

    const created = await repositories.cards.create({ columnId: todoId, title: 'Mercado' });

    expect(created).toMatchObject({
      description: '',
      priority: null,
      dueAt: null,
      completedAt: null,
      archivedAt: null,
    });
    expect(await titlesIn(repositories, todoId)).toEqual(['Estudar', 'Mercado']);
  });

  test('keeps the description, priority and due date given on creation', async () => {
    const created = await repositories.cards.create({
      columnId: todoId,
      title: 'Prova',
      description: 'Capítulos 1 a 3',
      priority: 'high',
      dueAt: '2026-05-20T13:00:00.000Z',
    });

    expect(await repositories.cards.getById(created.id)).toMatchObject({
      description: 'Capítulos 1 a 3',
      priority: 'high',
      dueAt: '2026-05-20T13:00:00.000Z',
    });
  });

  test('returns null for a card that does not exist', async () => {
    expect(await repositories.cards.getById('missing')).toBeNull();
  });

  test('updates only the given fields', async () => {
    const card = await repositories.cards.create({ columnId: todoId, title: 'Prova' });

    await repositories.cards.update(card.id, { priority: 'medium' });

    expect(await repositories.cards.getById(card.id)).toMatchObject({
      title: 'Prova',
      priority: 'medium',
    });
  });

  test('leaves archived cards out of the column', async () => {
    const [first] = await seedCards(repositories, todoId, ['A', 'B']);

    await repositories.cards.update(first, { archivedAt: '2026-05-18T12:00:00.000Z' });

    expect(await titlesIn(repositories, todoId)).toEqual(['B']);
  });

  test('lists archived cards of the columns, the most recently archived first', async () => {
    const [first, second] = await seedCards(repositories, todoId, ['A', 'B']);
    const [third] = await seedCards(repositories, doneId, ['C', 'D']);
    await repositories.cards.update(first, { archivedAt: '2026-05-18T10:00:00.000Z' });
    await repositories.cards.update(second, { archivedAt: '2026-05-18T12:00:00.000Z' });
    await repositories.cards.update(third, { archivedAt: '2026-05-18T11:00:00.000Z' });

    const archived = await repositories.cards.listArchivedByColumns([todoId, doneId]);

    expect(archived.map((card) => card.title)).toEqual(['B', 'C', 'A']);
    expect(await repositories.cards.listArchivedByColumns([])).toEqual([]);
  });

  describe('move', () => {
    test('moves a card between two others in the same column', async () => {
      const [first, second, third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

      await repositories.cards.move(third, todoId, { previousId: first, nextId: second });

      expect(await titlesIn(repositories, todoId)).toEqual(['A', 'C', 'B']);
    });

    test('writes only the moved card in the common case', async () => {
      const [first, second, third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);
      const before = await repositories.cards.getById(second);

      await repositories.cards.move(third, todoId, { previousId: first, nextId: second });

      expect(await repositories.cards.getById(second)).toEqual(before);
    });

    test('moves a card to another column', async () => {
      const [first] = await seedCards(repositories, todoId, ['A', 'B']);
      const [other] = await seedCards(repositories, doneId, ['X']);

      await repositories.cards.move(first, doneId, { nextId: other });

      expect(await titlesIn(repositories, todoId)).toEqual(['B']);
      expect(await titlesIn(repositories, doneId)).toEqual(['A', 'X']);
    });

    test('renumbers the column when there is no room left between two cards', async () => {
      const [first, second, third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);
      await repositories.cards.moveToPosition(second, todoId, 1 + MIN_POSITION_GAP / 2);

      await repositories.cards.move(third, todoId, { previousId: first, nextId: second });

      const cards = await repositories.cards.listByColumn(todoId);
      expect(cards.map((card) => [card.title, card.position])).toEqual([
        ['A', 1],
        ['C', 1.5],
        ['B', 2],
      ]);
    });

    test('puts a card back in an exact column and position', async () => {
      const [first] = await seedCards(repositories, todoId, ['A']);

      await repositories.cards.moveToPosition(first, doneId, 4.25);

      expect(await repositories.cards.getById(first)).toMatchObject({
        columnId: doneId,
        position: 4.25,
      });
    });
  });

  describe('remove and restore', () => {
    test('removes a card and returns everything that belonged to it', async () => {
      const { card, label } = await seedFullCard();

      const snapshot = await repositories.cards.remove(card.id);

      expect(snapshot.card).toEqual(card);
      expect(snapshot.labelIds).toEqual([label.id]);
      expect(snapshot.checklist.map((item) => [item.text, item.isDone])).toEqual([
        ['Passagens', true],
        ['Hotel', false],
      ]);
      expect(await repositories.cards.getById(card.id)).toBeNull();
      expect(await repositories.checklist.listByCard(card.id)).toEqual([]);
    });

    test('fails to remove a card that does not exist', async () => {
      await expect(repositories.cards.remove('missing')).rejects.toThrow('missing');
    });

    test('restores a removed card with its labels and checklist', async () => {
      const { card } = await seedFullCard();
      const snapshot = await repositories.cards.remove(card.id);

      await repositories.cards.restore(snapshot);

      expect(await repositories.cards.getById(card.id)).toEqual(card);
      expect((await repositories.labels.listByCard(card.id)).map((item) => item.name)).toEqual([
        'Lazer',
      ]);
      expect(await repositories.checklist.progressByCards([card.id])).toEqual({
        [card.id]: { done: 1, total: 2 },
      });
    });

    test('removes several cards at once, returning them in the given order', async () => {
      const [first, second, third] = await seedCards(repositories, todoId, ['A', 'B', 'C']);

      const snapshots = await repositories.cards.removeMany([third, 'missing', first]);

      expect(snapshots.map((snapshot) => snapshot.card.id)).toEqual([third, first]);
      expect(await titlesIn(repositories, todoId)).toEqual(['B']);
      expect(await repositories.cards.getById(second)).not.toBeNull();
      expect(await repositories.cards.removeMany([])).toEqual([]);
    });

    test('removes every card of a column, archived ones included', async () => {
      const [first] = await seedCards(repositories, todoId, ['A', 'B']);
      await repositories.cards.update(first, { archivedAt: '2026-05-18T12:00:00.000Z' });

      const snapshots = await repositories.cards.removeByColumn(todoId);

      expect(snapshots.map((snapshot) => snapshot.card.title)).toEqual(['A', 'B']);
      expect(await repositories.cards.listArchivedByColumns([todoId])).toEqual([]);
    });

    test('restores several cards at once', async () => {
      await seedCards(repositories, todoId, ['A', 'B']);
      const snapshots = await repositories.cards.removeByColumn(todoId);

      await repositories.cards.restoreAll(snapshots);

      expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
    });
  });

  describe('copyToColumn', () => {
    test('copies the active cards in order, with labels and checklist, as new cards', async () => {
      const { card } = await seedFullCard();
      const [archived] = await seedCards(repositories, todoId, ['Arquivado', 'Mercado']);
      await repositories.cards.update(archived, { archivedAt: '2026-05-18T12:00:00.000Z' });

      await repositories.cards.copyToColumn(todoId, doneId);

      const copies = await repositories.cards.listByColumn(doneId);
      const [tripCopy] = copies;
      expect(copies.map((copy) => copy.title)).toEqual(['Viagem', 'Mercado']);
      expect(tripCopy.id).not.toBe(card.id);
      expect((await repositories.labels.listByCard(tripCopy.id)).map((l) => l.name)).toEqual([
        'Lazer',
      ]);
      expect(await repositories.checklist.progressByCards([tripCopy.id])).toEqual({
        [tripCopy.id]: { done: 1, total: 2 },
      });
      // O original continua com as próprias subtarefas.
      expect(await repositories.checklist.listByCard(card.id)).toHaveLength(2);
    });

    test('swaps the labels for the ones of the destination board', async () => {
      const { label } = await seedFullCard();
      const otherBoard = await repositories.boards.create(
        (await repositories.folders.list())[0].id,
        'Outro',
      );
      const otherColumn = await repositories.columns.create(otherBoard.id, 'Pendentes');
      const otherLabel = await repositories.labels.create(otherBoard.id, {
        name: 'Lazer',
        color: 'mint',
      });

      await repositories.cards.copyToColumn(
        todoId,
        otherColumn.id,
        new Map([[label.id, otherLabel.id]]),
      );

      const [copy] = await repositories.cards.listByColumn(otherColumn.id);
      expect((await repositories.labels.listByCard(copy.id)).map((l) => l.id)).toEqual([
        otherLabel.id,
      ]);
    });
  });
});
