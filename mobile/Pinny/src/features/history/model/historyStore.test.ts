import { moveCardWithHistory } from '@/features/board/model/cardMove';
import { makeBoard } from '@/test/factories';
import {
  createTestRepositories,
  seedBoard,
  seedCards,
  type TestRepositories,
  titlesIn,
} from '@/test/testRepositories';

import { historyStore } from './historyStore';

let repositories: TestRepositories;
let todoId: string;
let doneId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const seed = await seedBoard(repositories);
  todoId = seed.todo.id;
  doneId = seed.done.id;
});

// Move o cartão para "Concluídas" registrando no histórico, como o arraste do quadro.
async function moveToDone(cardId: string) {
  const card = await repositories.cards.getById(cardId);
  if (!card) throw new Error('Cartão do teste não encontrado.');
  await moveCardWithHistory(
    cardId,
    doneId,
    {},
    { columnId: card.columnId, position: card.position },
    'Movimento',
    repositories.cards,
  );
}

describe('historyStore', () => {
  test('starts empty', async () => {
    expect(historyStore.nextUndoName()).toBeNull();
    expect(historyStore.nextRedoName()).toBeNull();
    expect(await historyStore.undoLast(repositories)).toBeNull();
    expect(await historyStore.redoLast(repositories)).toBeNull();
  });

  test('undoes the last action and offers to redo it', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    await moveToDone(cardId);

    const undone = await historyStore.undoLast(repositories);

    expect(undone?.description).toBe('Movimento');
    expect(await titlesIn(repositories, todoId)).toEqual(['A']);
    expect(historyStore.nextUndoName()).toBeNull();
    expect(historyStore.nextRedoName()).toBe('Movimento');
  });

  test('redoes the action that was undone', async () => {
    const [cardId] = await seedCards(repositories, todoId, ['A']);
    await moveToDone(cardId);
    await historyStore.undoLast(repositories);

    await historyStore.redoLast(repositories);

    expect(await titlesIn(repositories, doneId)).toEqual(['A']);
    expect(historyStore.nextUndoName()).toBe('Movimento');
    expect(historyStore.nextRedoName()).toBeNull();
  });

  test('undoes several actions, the most recent first', async () => {
    const [first, second] = await seedCards(repositories, todoId, ['A', 'B']);
    await moveToDone(first);
    await moveToDone(second);

    await historyStore.undoLast(repositories);
    const afterFirstUndo = await titlesIn(repositories, doneId);
    await historyStore.undoLast(repositories);

    expect(afterFirstUndo).toEqual(['A']);
    expect(await titlesIn(repositories, todoId)).toEqual(['A', 'B']);
  });

  test('a new action clears what could be redone', async () => {
    const [first, second] = await seedCards(repositories, todoId, ['A', 'B']);
    await moveToDone(first);
    await historyStore.undoLast(repositories);

    await moveToDone(second);

    expect(historyStore.nextRedoName()).toBeNull();
  });

  test('forgets the restore of a pinned board once another board is pinned in its folder', () => {
    const pinned = makeBoard({ folderId: 'folder-1', pinnedAt: '2026-05-01T10:00:00.000Z' });
    historyStore.record('Apagar Quadro', {
      kind: 'restoreBoard',
      snapshot: { board: pinned, labels: [], columns: [] },
    });
    historyStore.record('Renomeação', { kind: 'renameBoard', boardId: 'b', title: 'X' });

    historyStore.forgetPinnedBoardRestores('folder-1');

    expect(historyStore.nextUndoName()).toBe('Renomeação');
    historyStore.clear();
    expect(historyStore.nextUndoName()).toBeNull();
  });
});
