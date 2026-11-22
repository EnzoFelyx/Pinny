import { useCallback } from 'react';

import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { useCardDelete } from './useCardDelete';
import { useUnarchiveCards } from './useUnarchiveCards';

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

  const unarchive = useUnarchiveCards({ boardId, onDone, notifyUndoable, onSaveError });

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
