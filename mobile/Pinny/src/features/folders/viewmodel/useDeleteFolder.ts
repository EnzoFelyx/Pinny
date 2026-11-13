import { useCallback, useMemo, useState } from 'react';

import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import { cardRepository } from '@/features/card/model/cardRepository';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';

import { removeFolderWithContent } from '../model/folderRemoval';
import { folderRepository } from '../model/folderRepository';

const text = ptBR.folders;
const repositories = {
  folders: folderRepository,
  boards: boardRepository,
  columns: columnRepository,
  cards: cardRepository,
  labels: labelRepository,
};

interface PendingFolder {
  id: string;
  title: string;
  boardCount: number;
}

interface DeleteFolderOptions {
  // Logo depois do "Apagar" do alerta, antes de apagar (ex.: a tela da pasta volta para a Início).
  onConfirmed?: () => void;
}

// "Apagar" da pasta ("⋮" da Início ou "…" da tela da pasta): alerta nativo de confirmação, apaga a
// pasta com os quadros e tudo o que eles têm, e registra no histórico (chacoalhar ou snackbar
// desfazem). As telas recarregam quando o banco muda.
export function useDeleteFolder({ onConfirmed }: DeleteFolderOptions = {}) {
  const notifyUndoable = useUndoNotice();
  const [pending, setPending] = useState<PendingFolder | null>(null);

  // O alerta diz quantos quadros vão junto: a pasta e a contagem são lidas na hora.
  const request = useCallback((folderId: string) => {
    Promise.all([folderRepository.getById(folderId), boardRepository.listByFolder(folderId)])
      .then(([folder, boards]) => {
        if (folder) setPending({ id: folder.id, title: folder.title, boardCount: boards.length });
      })
      .catch((error: unknown) => {
        console.warn('Falha ao preparar a exclusão da pasta.', error);
        snackbarStore.show(ptBR.common.saveError);
      });
  }, []);
  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(async () => {
    const target = pending;
    setPending(null);
    if (!target) return;
    onConfirmed?.();
    try {
      const snapshot = await removeFolderWithContent(target.id, repositories);
      if (!snapshot) return;
      historyStore.record(ptBR.history.actions.deleteFolder, { kind: 'restoreFolder', snapshot });
      await notifyUndoable(text.folderDeleted);
    } catch (error: unknown) {
      console.warn('Falha ao apagar a pasta.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, [pending, notifyUndoable, onConfirmed]);

  const confirmRequest = useMemo<DestructiveConfirmRequest | null>(
    () =>
      pending
        ? {
            title: text.deleteFolderTitle(pending.title),
            message:
              pending.boardCount > 0 ? text.deleteFolderMessage(pending.boardCount) : undefined,
            confirmLabel: text.deleteBoardConfirm,
            cancelLabel: text.deleteBoardCancel,
          }
        : null,
    [pending],
  );

  return { confirmRequest, request, cancel, confirm };
}
