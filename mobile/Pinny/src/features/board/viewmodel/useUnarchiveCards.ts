import { useCallback } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { unarchiveCards } from '../model/archivedCards';

const text = ptBR.board.archived;

interface UnarchiveOptions {
  boardId: string;
  // Depois de desarquivar (ex.: fechar o modo de seleção ou a folha).
  onDone: () => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Desarquivar: cada cartão volta ao topo da coluna de onde saiu, numa ação só no histórico
// ("Desarquivar Cartões"), com o aviso de desfazer. Usado pela tela "Arquivados" e pela folha
// "Cartão arquivado".
export function useUnarchiveCards({
  boardId,
  onDone,
  notifyUndoable,
  onSaveError,
}: UnarchiveOptions) {
  return useCallback(
    async (cardIds: readonly string[]) => {
      if (cardIds.length === 0) return;
      try {
        const result = await unarchiveCards(boardId, cardIds);
        if (!result) return;
        historyStore.record(ptBR.history.actions.unarchiveCards, result.undo);
        onDone();
        await notifyUndoable(text.unarchived(cardIds.length, result.columnTitle));
      } catch (error: unknown) {
        console.warn('Falha ao desarquivar os cartões.', error);
        onSaveError();
      }
    },
    [boardId, onDone, notifyUndoable, onSaveError],
  );
}
