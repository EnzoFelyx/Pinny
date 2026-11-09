import { useCallback, useMemo, useState } from 'react';

import type { Board } from '@/features/board/model/board.schema';
import { type BoardSnapshot, removeBoardWithContent } from '@/features/board/model/boardRemoval';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import { cardRepository } from '@/features/card/model/cardRepository';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import type { UndoOperation } from '@/features/history/model/actionHistory';
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

function confirmRequestFor(targets: readonly Board[]): DestructiveConfirmRequest | null {
  const [first] = targets;
  if (!first) return null;
  const isSingle = targets.length === 1;
  return {
    title: isSingle ? text.deleteBoardTitle(first.title) : text.deleteBoardsTitle(targets.length),
    message: isSingle ? text.deleteBoardMessage : text.deleteBoardsMessage,
    confirmLabel: text.deleteBoardConfirm,
    cancelLabel: text.deleteBoardCancel,
  };
}

// Um quadro: desfaz com o retrato dele; vários: uma ação só no histórico.
function undoFor(snapshots: readonly BoardSnapshot[]): UndoOperation {
  const operations = snapshots.map((snapshot): UndoOperation => ({
    kind: 'restoreBoard',
    snapshot,
  }));
  return operations.length === 1 && operations[0]
    ? operations[0]
    : { kind: 'sequence', operations };
}

interface DeleteBoardOptions {
  // Logo depois do "Excluir" do alerta, antes de apagar (ex.: o quadro aberto volta para a tela
  // anterior, para não ficar mostrando um quadro que sumiu).
  onConfirmed?: () => void;
}

// "Excluir quadro" (segurar o quadro na tela da pasta ou "…" do quadro) e "Excluir" do modo
// "Selecionar": pede confirmação no alerta nativo, apaga os quadros com colunas, cartões e
// etiquetas e registra uma ação só no histórico (chacoalhar ou snackbar desfazem). As telas
// recarregam quando o banco muda.
export function useDeleteBoard(boards: readonly Board[], { onConfirmed }: DeleteBoardOptions = {}) {
  const notifyUndoable = useUndoNotice();
  const [targets, setTargets] = useState<Board[]>([]);

  const request = useCallback(
    (boardIds: readonly string[]) =>
      setTargets(boards.filter((board) => boardIds.includes(board.id))),
    [boards],
  );
  const cancel = useCallback(() => setTargets([]), []);

  const confirm = useCallback(async () => {
    const chosen = targets;
    setTargets([]);
    if (chosen.length === 0) return;
    onConfirmed?.();
    try {
      const snapshots: BoardSnapshot[] = [];
      for (const board of chosen) {
        const snapshot = await removeBoardWithContent(board.id, repositories);
        if (snapshot) snapshots.push(snapshot);
      }
      if (snapshots.length === 0) return;
      const isSingle = snapshots.length === 1;
      historyStore.record(
        isSingle ? ptBR.history.actions.deleteBoard : ptBR.history.actions.deleteBoards,
        undoFor(snapshots),
      );
      await notifyUndoable(isSingle ? text.boardDeleted : text.boardsDeleted(snapshots.length));
    } catch (error: unknown) {
      console.warn('Falha ao excluir os quadros.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, [targets, notifyUndoable, onConfirmed]);

  const confirmRequest = useMemo(() => confirmRequestFor(targets), [targets]);

  return { confirmRequest, request, cancel, confirm };
}
