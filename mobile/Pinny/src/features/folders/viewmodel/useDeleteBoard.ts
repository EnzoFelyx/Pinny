import { useCallback, useMemo, useState } from 'react';

import type { Board } from '@/features/board/model/board.schema';
import { removeBoardWithContent } from '@/features/board/model/boardRemoval';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import { cardRepository } from '@/features/card/model/cardRepository';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders;
const repositories = {
  boards: boardRepository,
  columns: columnRepository,
  cards: cardRepository,
  labels: labelRepository,
};

// "Excluir quadro" (segurar o quadro na tela da pasta): pede confirmação no alerta nativo, apaga o
// quadro com colunas, cartões e etiquetas e registra no histórico (chacoalhar ou snackbar
// desfazem). A tela recarrega sozinha quando o banco muda.
export function useDeleteBoard(boards: readonly Board[]) {
  const notifyUndoable = useUndoNotice();
  const [target, setTarget] = useState<Board | null>(null);

  const request = useCallback(
    (boardId: string) => setTarget(boards.find((board) => board.id === boardId) ?? null),
    [boards],
  );
  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(async () => {
    const board = target;
    setTarget(null);
    if (!board) return;
    try {
      const snapshot = await removeBoardWithContent(board.id, repositories);
      if (!snapshot) return;
      historyStore.record(ptBR.history.actions.deleteBoard, { kind: 'restoreBoard', snapshot });
      await notifyUndoable(text.boardDeleted);
    } catch (error: unknown) {
      console.warn('Falha ao excluir o quadro.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, [target, notifyUndoable]);

  const confirmRequest = useMemo<DestructiveConfirmRequest | null>(
    () =>
      target
        ? {
            title: text.deleteBoardTitle(target.title),
            message: text.deleteBoardMessage,
            confirmLabel: text.deleteBoardConfirm,
            cancelLabel: text.deleteBoardCancel,
          }
        : null,
    [target],
  );

  return { confirmRequest, request, cancel, confirm };
}
