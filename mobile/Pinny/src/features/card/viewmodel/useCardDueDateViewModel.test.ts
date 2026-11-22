import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router, usePreventRemove } from 'expo-router';

import { db } from '@/db/client';
import { historyStore } from '@/features/history/model/historyStore';
import { createTestRepositories, seedBoard } from '@/test/testRepositories';

import { useCardDueDateViewModel } from './useCardDueDateViewModel';

const repositories = createTestRepositories(db);

async function seedCard(dueAt: string | null = null) {
  const { todo } = await seedBoard(repositories);
  const card = await repositories.cards.create({ columnId: todo.id, title: 'Viagem' });
  if (dueAt) await repositories.cards.update(card.id, { dueAt });
  return card.id;
}

async function renderDueDate(cardId: string) {
  const hook = await renderHook(() => useCardDueDateViewModel(cardId));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

// Se a última renderização travou o "puxar para fechar" (rascunho diferente do que abriu).
const isClosingBlocked = () => jest.mocked(usePreventRemove).mock.calls.at(-1)?.[0];

beforeEach(() => {
  jest.mocked(router.back).mockClear();
  jest.mocked(usePreventRemove).mockClear();
});

describe('useCardDueDateViewModel', () => {
  test('starts tomorrow at 9h when the card has no deadline', async () => {
    const cardId = await seedCard();

    const { result } = await renderDueDate(cardId);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    expect(result.current.selection?.getTime()).toBe(tomorrow.getTime());
    expect(result.current.canRemove).toBe(false);
  });

  test('saves the chosen date with undo and closes', async () => {
    const cardId = await seedCard();
    const { result } = await renderDueDate(cardId);
    const chosen = new Date(2026, 11, 24, 18, 30);

    await act(async () => result.current.changeDate(chosen));
    await act(async () => result.current.save());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect((await repositories.cards.getById(cardId))?.dueAt).toBe(chosen.toISOString());
    expect(historyStore.nextUndoName()).not.toBeNull();
  });

  test('removes the deadline of a card that has one', async () => {
    const cardId = await seedCard(new Date(2026, 11, 24, 18, 30).toISOString());
    const { result } = await renderDueDate(cardId);

    const canRemove = result.current.canRemove;
    await act(async () => result.current.remove());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect(canRemove).toBe(true);
    expect((await repositories.cards.getById(cardId))?.dueAt).toBeNull();
  });

  test('blocks closing with unsaved changes and asks to discard', async () => {
    const cardId = await seedCard();
    const { result } = await renderDueDate(cardId);
    const blockedBefore = isClosingBlocked();

    await act(async () => result.current.changeDate(new Date(2026, 11, 24, 18, 30)));
    const blockedAfter = isClosingBlocked();
    const onBlocked = jest.mocked(usePreventRemove).mock.calls.at(-1)?.[1];
    await act(async () => onBlocked?.({} as never));

    expect(blockedBefore).toBe(false);
    expect(blockedAfter).toBe(true);
    expect(result.current.discardRequest?.title).toBe('Descartar alterações?');
  });

  test('closes without saving when the changes are discarded', async () => {
    const cardId = await seedCard();
    const { result } = await renderDueDate(cardId);

    await act(async () => result.current.changeDate(new Date(2026, 11, 24, 18, 30)));
    await act(async () => result.current.confirmDiscard());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect(isClosingBlocked()).toBe(false);
    expect((await repositories.cards.getById(cardId))?.dueAt).toBeNull();
  });
});
