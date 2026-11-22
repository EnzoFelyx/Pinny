import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { db } from '@/db/client';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { emitDataChange } from '@/test/dataChanges';
import { createTestRepositories, seedBoard, seedCards } from '@/test/testRepositories';

import { useArchivedCardViewModel } from './useArchivedCardViewModel';

const repositories = createTestRepositories(db);

// Cartão "Viagem" arquivado na coluna "Pendentes", embaixo de um cartão ativo.
async function seedArchivedCard() {
  const { todo } = await seedBoard(repositories);
  const [active, archived] = await seedCards(repositories, todo.id, ['Mercado', 'Viagem']);
  await repositories.cards.update(archived, { archivedAt: new Date().toISOString() });
  return { todoId: todo.id, activeId: active, cardId: archived };
}

async function renderSheet(cardId: string) {
  const hook = await renderHook(() => useArchivedCardViewModel(cardId));
  await waitFor(() => expect(hook.result.current.sheet).not.toBeNull());
  return hook;
}

beforeEach(() => {
  jest.mocked(router.back).mockClear();
});

describe('useArchivedCardViewModel', () => {
  test('shows the archived card ready for the sheet', async () => {
    const { cardId } = await seedArchivedCard();

    const { result } = await renderSheet(cardId);

    expect(result.current.sheet).toMatchObject({
      title: 'Viagem',
      unarchiveLabel: 'Desarquivar em Pendentes',
    });
    expect(result.current.sheet?.rows.map((row) => row.kind)).toEqual(['column', 'archived']);
  });

  test('unarchives to the top of the origin column, closes and offers undo', async () => {
    const { cardId, todoId } = await seedArchivedCard();
    const { result } = await renderSheet(cardId);

    await act(() => result.current.unarchive());

    const titles = (await repositories.cards.listByColumn(todoId)).map((card) => card.title);
    expect(titles).toEqual(['Viagem', 'Mercado']);
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(historyStore.nextUndoName()).not.toBeNull();
    expect(snackbarStore.getSnapshot()?.message).toBe('Cartão desarquivado em Pendentes');
  });

  test('asks before deleting and closes after deleting', async () => {
    const { cardId } = await seedArchivedCard();
    const { result } = await renderSheet(cardId);

    await act(async () => result.current.requestDelete());
    const title = result.current.deleteRequest?.title;
    await act(() => result.current.confirmDelete());

    expect(title).toBe('Apagar o cartão "Viagem"?');
    expect(await repositories.cards.getById(cardId)).toBeNull();
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  test('closes by itself when the card is unarchived somewhere else', async () => {
    const { cardId } = await seedArchivedCard();
    await renderSheet(cardId);

    await repositories.cards.update(cardId, { archivedAt: null });
    await act(async () => emitDataChange());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
  });
});
