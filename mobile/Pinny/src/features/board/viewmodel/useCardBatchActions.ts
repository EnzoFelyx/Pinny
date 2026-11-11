import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { archiveCards } from '../model/cardBatch';
import { cardsMovedSignal } from './cardsMovedSignal';
import { useCardDelete } from './useCardDelete';

const text = ptBR.board.selection;
const actionNames = ptBR.history.actions;

interface CardBatchOptions {
  boardId: string;
  // Selecionados na ordem do quadro (colunas e posições), não na ordem dos toques.
  selectedIds: readonly string[];
  // Título do cartão, para o alerta de apagar um só.
  titleOf: (cardId: string) => string | undefined;
  // Fecha o modo de seleção (depois de cada ação).
  onDone: () => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Barra de baixo do modo de seleção: Mover (folha com quadro e coluna), Arquivar e Apagar (com
// confirmação). Cada ação vira uma só no histórico e fecha o modo.
export function useCardBatchActions({
  boardId,
  selectedIds,
  titleOf,
  onDone,
  notifyUndoable,
  onSaveError,
}: CardBatchOptions) {
  const hasSelection = selectedIds.length > 0;

  // A folha "Mover" terminou: os cartões já estão no destino.
  useEffect(() => cardsMovedSignal.subscribe(onDone), [onDone]);

  const openMove = useCallback(() => {
    if (!hasSelection) return;
    router.push({
      pathname: '/board/[boardId]/move-cards',
      params: { boardId, cardIds: selectedIds.join(',') },
    });
  }, [boardId, hasSelection, selectedIds]);

  const archive = useCallback(async () => {
    if (!hasSelection) return;
    const ids = [...selectedIds];
    try {
      const undo = await archiveCards(ids, cardRepository);
      historyStore.record(actionNames.archiveCards, undo);
      onDone();
      await notifyUndoable(text.cardsArchived(ids.length));
    } catch (error: unknown) {
      console.warn('Falha ao arquivar os cartões.', error);
      onSaveError();
    }
  }, [hasSelection, selectedIds, onDone, notifyUndoable, onSaveError]);

  const { request, deleteRequest, confirmDelete, cancelDelete } = useCardDelete({
    titleOf,
    onDone,
    notifyUndoable,
    onSaveError,
  });
  const requestDelete = useCallback(() => {
    if (hasSelection) request(selectedIds);
  }, [hasSelection, selectedIds, request]);

  return {
    canAct: hasSelection,
    openMove,
    archive,
    requestDelete,
    deleteRequest,
    confirmDelete,
    cancelDelete,
  };
}
