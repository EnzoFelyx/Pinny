import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { db } from '@/db/client';
import { historyStore } from '@/features/history/model/historyStore';
import { openRoute } from '@/navigation/openRoute';
import { emitDataChange } from '@/test/dataChanges';
import { createTestRepositories, seedBoard } from '@/test/testRepositories';

import { useCardLabelsViewModel } from './useCardLabelsViewModel';
import { useNewLabelViewModel } from './useNewLabelViewModel';

jest.mock('@/navigation/openRoute', () => ({ openRoute: jest.fn() }));

const repositories = createTestRepositories(db);

async function seedCardWithLabels() {
  const { board, todo } = await seedBoard(repositories);
  const card = await repositories.cards.create({ columnId: todo.id, title: 'Viagem' });
  const home = await repositories.labels.create(board.id, { name: 'Casa', color: 'lavender' });
  const study = await repositories.labels.create(board.id, { name: 'Estudos', color: 'mint' });
  await repositories.labels.setForCard(card.id, [home.id]);
  return { cardId: card.id, home, study };
}

const labelNames = async (cardId: string) =>
  (await repositories.labels.listByCard(cardId)).map((label) => label.name);

beforeEach(() => {
  jest.mocked(router.back).mockClear();
  jest.mocked(openRoute).mockClear();
});

describe('useCardLabelsViewModel', () => {
  async function renderLabels(cardId: string) {
    const hook = await renderHook(() => useCardLabelsViewModel(cardId));
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook;
  }

  test('lists the board labels with the ones on the card marked', async () => {
    const { cardId, home, study } = await seedCardWithLabels();

    const { result } = await renderLabels(cardId);

    expect(result.current.options).toEqual([
      { id: home.id, name: 'Casa', color: 'lavender', isSelected: true },
      { id: study.id, name: 'Estudos', color: 'mint', isSelected: false },
    ]);
    expect(result.current.emptyText).toBeNull();
  });

  test('marks and unmarks a label, each with undo', async () => {
    const { cardId, home, study } = await seedCardWithLabels();
    const { result } = await renderLabels(cardId);

    await act(async () => result.current.toggle(study.id));
    await waitFor(async () => expect(await labelNames(cardId)).toEqual(['Casa', 'Estudos']));
    await act(async () => emitDataChange());
    await waitFor(() => expect(result.current.options[1].isSelected).toBe(true));
    await act(async () => result.current.toggle(home.id));

    await waitFor(async () => expect(await labelNames(cardId)).toEqual(['Estudos']));
    expect(historyStore.nextUndoName()).not.toBeNull();
  });

  test('offers the priorities from high to low, then none, and saves the choice', async () => {
    const { cardId } = await seedCardWithLabels();
    const { result } = await renderLabels(cardId);

    const order = result.current.priorityOptions.map((option) => option.value);
    await act(async () => result.current.setPriority('high'));

    expect(order).toEqual(['high', 'medium', 'low', null]);
    await waitFor(async () =>
      expect((await repositories.cards.getById(cardId))?.priority).toBe('high'),
    );
  });

  test('opens the new label sheet', async () => {
    const { cardId } = await seedCardWithLabels();
    const { result } = await renderLabels(cardId);

    result.current.openNewLabel();

    expect(openRoute).toHaveBeenCalledWith({
      pathname: '/card/[cardId]/new-label',
      params: { cardId },
    });
  });
});

describe('useNewLabelViewModel', () => {
  async function renderNewLabel(cardId: string) {
    const hook = await renderHook(() => useNewLabelViewModel(cardId));
    // A cor sugerida só sai da primeira livre depois de ler as etiquetas do quadro.
    await waitFor(() => expect(hook.result.current.color).toBe('peach'));
    return hook;
  }

  test('suggests the first color the board does not use yet', async () => {
    const { cardId } = await seedCardWithLabels();

    const { result } = await renderNewLabel(cardId);

    expect(result.current.canCreate).toBe(false);
  });

  test('creates the label, marks it on the card and closes', async () => {
    const { cardId } = await seedCardWithLabels();
    const { result } = await renderNewLabel(cardId);

    await act(async () => result.current.changeName('  Viagens  '));
    await act(() => result.current.create());

    expect(await labelNames(cardId)).toEqual(['Casa', 'Viagens']);
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  test('marks the existing label instead of repeating a name', async () => {
    const { cardId } = await seedCardWithLabels();
    const { result } = await renderNewLabel(cardId);

    await act(async () => result.current.changeName('estudos'));
    await act(() => result.current.create());

    expect(await labelNames(cardId)).toEqual(['Casa', 'Estudos']);
  });
});
