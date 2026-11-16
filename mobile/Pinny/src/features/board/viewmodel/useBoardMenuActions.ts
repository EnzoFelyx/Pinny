import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

import type { Board } from '../model/board.schema';
import { duplicateBoard } from '../model/boardCopy';
import { boardRepository } from '../model/boardRepository';
import { columnRepository } from '../model/columnRepository';
import { labelRepository } from '../model/labelRepository';
import { useDeleteBoard } from './useDeleteBoard';

const text = ptBR.board;
const repositories = {
  boards: boardRepository,
  columns: columnRepository,
  cards: cardRepository,
  labels: labelRepository,
};

interface BoardMenuActionsOptions {
  board: Board | undefined;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Ações do "…" do quadro sobre o quadro em si: duplicar, mover para outra pasta e excluir. Todas
// entram no histórico (chacoalhar ou snackbar desfazem).
export function useBoardMenuActions({
  board,
  notifyUndoable,
  onSaveError,
}: BoardMenuActionsOptions) {
  // Excluir: ao confirmar, volta para a tela anterior e só então apaga.
  const deletable = useMemo(() => (board ? [board] : []), [board]);
  const deleteBoard = useDeleteBoard(deletable, { onConfirmed: router.back });
  const requestDelete = deleteBoard.request;

  // Duplicar: a cópia fica logo depois na mesma pasta e abre no lugar do quadro atual (replace:
  // o voltar leva para onde o usuário estava antes do original).
  const duplicate = useCallback(async () => {
    if (!board) return;
    try {
      const copy = await duplicateBoard(board, text.boardCopyTitle(board.title), repositories);
      historyStore.record(ptBR.history.actions.duplicateBoard, {
        kind: 'deleteBoard',
        boardId: copy.id,
      });
      router.replace({ pathname: '/board/[boardId]', params: { boardId: copy.id } });
      await notifyUndoable(text.boardDuplicated);
    } catch (error: unknown) {
      console.warn('Falha ao duplicar o quadro.', error);
      onSaveError();
    }
  }, [board, notifyUndoable, onSaveError]);

  return {
    duplicateBoard: duplicate,
    // Mover quadro: folha nativa com as pastas.
    moveBoardToFolder: useCallback(() => {
      if (board) openRoute({ pathname: '/board/[boardId]/move', params: { boardId: board.id } });
    }, [board]),
    requestDeleteBoard: useCallback(() => {
      if (board) requestDelete([board.id]);
    }, [board, requestDelete]),
    deleteBoardRequest: deleteBoard.confirmRequest,
    confirmDeleteBoard: deleteBoard.confirm,
    cancelDeleteBoard: deleteBoard.cancel,
  };
}
