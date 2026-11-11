import { useCallback } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { unarchiveCards } from '../model/archivedCards';
import { useCardDelete } from './useCardDelete';

const text = ptBR.board.archived;

interface ArchivedActionsOptions {
  boardId: string;
  // Selecionados na ordem da tela, não na ordem dos toques.
  selectedIds: readonly string[];
  // Todos os arquivados do quadro, sem olhar busca nem filtro ("Apagar todos").
  allIds: readonly string[];
  titleOf: (cardId: string) => string | undefined;
  // Fecha o modo de seleção depois de cada ação.
  onDone: () => void;
  onSaveError: () => void;
}

// Ações da tela "Arquivados": desarquivar (um cartão pelo toque longo ou os selecionados) e apagar
// (os selecionados ou todos), cada uma com uma ação só no histórico e o aviso de desfazer.
export function useArchivedActions({
  boardId,
  selectedIds,
  allIds,
  titleOf,
  onDone,
  onSaveError,
}: ArchivedActionsOptions) {
  const notifyUndoable = useUndoNotice();

  const unarchive = useCallback(
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

  const { request, deleteRequest, confirmDelete, cancelDelete } = useCardDelete({
    titleOf,
    onDone,
    notifyUndoable,
    onSaveError,
  });

  return {
    unarchiveOne: useCallback((cardId: string) => unarchive([cardId]), [unarchive]),
    unarchiveSelected: useCallback(() => unarchive(selectedIds), [unarchive, selectedIds]),
    requestDeleteSelected: useCallback(() => request(selectedIds), [request, selectedIds]),
    requestDeleteAll: useCallback(
      () => request(allIds, text.deleteAllTitle(allIds.length)),
      [request, allIds],
    ),
    deleteRequest,
    confirmDelete,
    cancelDelete,
  };
}
