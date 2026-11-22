import { act, renderHook } from '@testing-library/react-native';

import { cardRepository } from '@/features/card/model/cardRepository';
import { checklistRepository } from '@/features/card/model/checklistRepository';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { folderRepository } from '@/features/folders/model/folderRepository';
import type { UndoOperation } from '@/features/history/model/actionHistory';

import type { ChecklistItem } from '../model/card.schema';
import { useCardChecklist } from './useCardChecklist';

// Os repositórios padrão usam o banco em memória do Jest (src/test/nativeMocks.ts).
async function seedCard(): Promise<string> {
  const folder = await folderRepository.create({ title: 'Pessoal' });
  const board = await boardRepository.create(folder.id, 'Semana');
  const column = await columnRepository.create(board.id, 'Pendentes');
  return (await cardRepository.create({ columnId: column.id, title: 'Viagem' })).id;
}

// Guarda as operações registradas, como o ViewModel da tela faz com o histórico.
function createRunEdit() {
  const recorded: UndoOperation[] = [];
  const runEdit = jest.fn(async (_name: string, edit: () => Promise<UndoOperation | null>) => {
    const undo = await edit();
    if (undo) recorded.push(undo);
  });
  return { runEdit, recorded };
}

async function renderChecklist(cardId: string, items: ChecklistItem[]) {
  const { runEdit, recorded } = createRunEdit();
  const hook = await renderHook(() => useCardChecklist({ cardId, items, runEdit }));
  return { ...hook, runEdit, recorded };
}

describe('useCardChecklist', () => {
  test('shows the progress of the steps, ready for the screen', async () => {
    const cardId = await seedCard();
    const first = await checklistRepository.add(cardId, 'Passagens');
    await checklistRepository.add(cardId, 'Hotel');
    await checklistRepository.setDone(first.id, true);

    const { result } = await renderChecklist(cardId, await checklistRepository.listByCard(cardId));

    expect(result.current).toMatchObject({
      hasItems: true,
      progress: 0.5,
      progressText: '1 de 2',
      progressA11y: '1 de 2 passos concluídos',
    });
    expect(result.current.items[0]).toMatchObject({
      text: 'Passagens',
      isDone: true,
      accessibilityLabel: 'Passo Passagens',
    });
  });

  test('has no progress without steps', async () => {
    const { result } = await renderChecklist(await seedCard(), []);

    expect(result.current).toMatchObject({ hasItems: false, progress: 0 });
  });

  test('adds a trimmed step and ignores an empty one', async () => {
    const cardId = await seedCard();
    const { result, runEdit } = await renderChecklist(cardId, []);

    await act(() => result.current.add('   '));
    await act(() => result.current.add('  Malas  '));

    expect(runEdit).toHaveBeenCalledTimes(1);
    expect((await checklistRepository.listByCard(cardId)).map((item) => item.text)).toEqual([
      'Malas',
    ]);
  });

  test('clearing the text of a step removes it', async () => {
    const cardId = await seedCard();
    const item = await checklistRepository.add(cardId, 'Hotel');
    const { result, recorded } = await renderChecklist(cardId, [item]);

    await act(() => result.current.rename(item.id, '  '));

    expect(await checklistRepository.listByCard(cardId)).toEqual([]);
    expect(recorded).toEqual([{ kind: 'restoreChecklistItem', item }]);
  });

  test('renames and toggles a step', async () => {
    const cardId = await seedCard();
    const item = await checklistRepository.add(cardId, 'Hotel');
    const { result } = await renderChecklist(cardId, [item]);

    await act(() => result.current.rename(item.id, 'Pousada'));
    await act(() => result.current.toggle(item.id, true));

    expect(await checklistRepository.getById(item.id)).toMatchObject({
      text: 'Pousada',
      isDone: true,
    });
  });
});
