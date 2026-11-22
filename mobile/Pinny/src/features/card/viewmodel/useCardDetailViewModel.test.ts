import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { db } from '@/db/client';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { openRoute } from '@/navigation/openRoute';
import { emitDataChange } from '@/test/dataChanges';
import { createTestRepositories, seedBoard } from '@/test/testRepositories';

import { useCardDetailViewModel } from './useCardDetailViewModel';

jest.mock('@/navigation/openRoute', () => ({ openRoute: jest.fn() }));

// Os mesmos repositórios que a tela usa: o banco do app, em memória no Jest.
const repositories = createTestRepositories(db);

async function seedCard() {
  const { board, todo } = await seedBoard(repositories);
  const card = await repositories.cards.create({ columnId: todo.id, title: 'Viagem' });
  return { board, todo, cardId: card.id };
}

async function renderDetail(cardId: string) {
  const hook = await renderHook(() => useCardDetailViewModel(cardId));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  jest.mocked(router.back).mockClear();
  jest.mocked(openRoute).mockClear();
});

describe('useCardDetailViewModel', () => {
  test('shows the card ready for the screen', async () => {
    const { board, cardId } = await seedCard();
    const label = await repositories.labels.create(board.id, { name: 'Casa', color: 'mint' });
    await repositories.labels.setForCard(cardId, [label.id]);
    await repositories.cards.update(cardId, { priority: 'high', description: 'Passagens' });

    const { result } = await renderDetail(cardId);

    expect(result.current).toMatchObject({
      breadcrumb: 'Pessoal / Pendentes',
      title: 'Viagem',
      description: 'Passagens',
      priority: 'high',
      labels: [{ id: label.id, name: 'Casa', color: 'mint' }],
      statusText: 'Pendentes',
      dueDate: null,
    });
  });

  test('shows the deadline block in the tone of its state', async () => {
    const { cardId } = await seedCard();
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await repositories.cards.update(cardId, { dueAt: inTwoHours.toISOString() });

    const { result } = await renderDetail(cardId);

    expect(result.current.deadline?.status).toBe('soon');
    expect(result.current.dueDate?.status).toBe('soon');
    expect(result.current.dueDate?.text).toMatch(/ · \d{2}:\d{2}$/);
  });

  test('saves the title trimmed and records it for undo', async () => {
    const { cardId } = await seedCard();
    const { result } = await renderDetail(cardId);

    await act(async () => result.current.renameTitle('  Viagem de férias  '));

    await waitFor(async () =>
      expect((await repositories.cards.getById(cardId))?.title).toBe('Viagem de férias'),
    );
    expect(historyStore.nextUndoName()).not.toBeNull();
  });

  test('keeps the old title when the new one is blank', async () => {
    const { cardId } = await seedCard();
    const { result } = await renderDetail(cardId);

    await act(async () => result.current.renameTitle('   '));

    expect((await repositories.cards.getById(cardId))?.title).toBe('Viagem');
    expect(historyStore.nextUndoName()).toBeNull();
  });

  test('archives the card, closes the screen and offers undo', async () => {
    const { cardId } = await seedCard();
    const { result } = await renderDetail(cardId);

    await act(() => result.current.archive());

    expect((await repositories.cards.getById(cardId))?.archivedAt).not.toBeNull();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(snackbarStore.getSnapshot()?.message).toBe('Cartão arquivado');
  });

  test('asks before deleting and deletes on confirm', async () => {
    const { cardId } = await seedCard();
    const { result } = await renderDetail(cardId);

    await act(async () => result.current.requestDelete());
    const title = result.current.deleteRequest?.title;
    await act(() => result.current.confirmDelete());

    expect(title).toBe('Apagar o cartão "Viagem"?');
    expect(await repositories.cards.getById(cardId)).toBeNull();
  });

  test('closes when the card is deleted somewhere else', async () => {
    const { cardId } = await seedCard();
    await renderDetail(cardId);

    await repositories.cards.remove(cardId);
    await act(async () => emitDataChange());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
  });

  test('opens the sheets of labels, due date and move', async () => {
    const { cardId } = await seedCard();
    const { result } = await renderDetail(cardId);

    result.current.openLabels();
    result.current.openDueDate();
    result.current.openMove();

    expect(jest.mocked(openRoute).mock.calls.map(([route]) => route)).toEqual([
      { pathname: '/card/[cardId]/labels', params: { cardId } },
      { pathname: '/card/[cardId]/due-date', params: { cardId } },
      { pathname: '/card/[cardId]/move', params: { cardId } },
    ]);
  });
});
