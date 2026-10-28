import { useCallback, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import {
  applyUndo,
  type HistoryEntry,
  popEntry,
  pushEntry,
} from '@/features/history/model/actionHistory';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/time';

import {
  clearAllData,
  type DataSummary,
  findFirstCard,
  getDataSummary,
  seedSampleBoard,
} from '../model/devDataService';
import { galleryText } from '../model/gallerySamples';

const text = galleryText.data;

export function useDevDataViewModel() {
  // A leitura do SQLite é síncrona: os totais já entram no estado inicial.
  const [summary, setSummary] = useState<DataSummary>(getDataSummary);
  const [history, setHistory] = useState<readonly HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(() => setSummary(getDataSummary()), []);

  // Toda ação passa por aqui: atualiza os totais e mostra um erro amigável se algo falhar.
  const run = useCallback(
    async (action: () => Promise<string | null>) => {
      try {
        setFeedback(await action());
      } catch (error: unknown) {
        console.warn('Falha na operação de dados da galeria.', error);
        setFeedback(text.error);
      } finally {
        refresh();
      }
    },
    [refresh],
  );

  const record = (description: string, undo: HistoryEntry['undo']) =>
    setHistory((current) =>
      pushEntry(current, { id: createId(), description, createdAt: nowIso(), undo }),
    );

  return {
    summaryText: text.summary(summary),
    feedback,
    canUndo: history.length > 0,
    seed: () => run(async () => (await seedSampleBoard(), text.seeded)),
    moveFirstCard: () =>
      run(async () => {
        const found = await findFirstCard();
        if (!found) return text.noCard;
        const { card, nextColumnId } = found;
        await cardRepository.move(card.id, nextColumnId, {});
        record(text.moved, {
          kind: 'moveCard',
          cardId: card.id,
          columnId: card.columnId,
          position: card.position,
        });
        return text.moved;
      }),
    deleteFirstCard: () =>
      run(async () => {
        const found = await findFirstCard();
        if (!found) return text.noCard;
        const snapshot = await cardRepository.remove(found.card.id);
        record(text.deleted, { kind: 'restoreCard', snapshot });
        return text.deleted;
      }),
    undo: () =>
      run(async () => {
        const { entry, rest } = popEntry(history);
        if (!entry) return null;
        await applyUndo(entry.undo, { cards: cardRepository });
        setHistory(rest);
        return text.undone(entry.description);
      }),
    clearAll: () =>
      run(async () => {
        clearAllData();
        setHistory([]);
        return text.cleared;
      }),
  };
}
