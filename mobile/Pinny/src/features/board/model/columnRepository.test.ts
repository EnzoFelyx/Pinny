import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

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

const titles = async () =>
  (await repositories.columns.listByBoard(boardId)).map((column) => column.title);

describe('columnRepository', () => {
  test('creates new columns at the end of the board', async () => {
    await repositories.columns.create(boardId, 'Em andamento');

    expect(await titles()).toEqual(['Pendentes', 'Concluídas', 'Em andamento']);
  });

  test('renames a column', async () => {
    await repositories.columns.rename(todoId, 'A fazer');

    expect(await titles()).toEqual(['A fazer', 'Concluídas']);
  });

  test('moves a column before another one', async () => {
    await repositories.columns.move(doneId, { nextId: todoId });

    expect(await titles()).toEqual(['Concluídas', 'Pendentes']);
  });

  test('fails to move a column that does not exist', async () => {
    await expect(repositories.columns.move('missing', {})).rejects.toThrow('missing');
  });

  test('puts a column back in an exact position', async () => {
    await repositories.columns.moveToPosition(doneId, 0.5);

    expect(await titles()).toEqual(['Concluídas', 'Pendentes']);
  });

  test('removing a column removes its cards', async () => {
    const card = await repositories.cards.create({ columnId: todoId, title: 'Estudar' });

    await repositories.columns.remove(todoId);

    expect(await titles()).toEqual(['Concluídas']);
    expect(await repositories.cards.getById(card.id)).toBeNull();
  });

  test('restores a removed column exactly as it was', async () => {
    const column = await repositories.columns.getById(todoId);
    await repositories.columns.remove(todoId);

    if (column) await repositories.columns.restore(column);

    expect(await repositories.columns.getById(todoId)).toEqual(column);
    expect(await titles()).toEqual(['Pendentes', 'Concluídas']);
  });
});
