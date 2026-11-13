import { useCallback, useMemo, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, withColumnRemoved } from '../model/boardData';
import { removeColumnWithCards } from '../model/columnRemoval';
import { columnRepository } from '../model/columnRepository';

const text = ptBR.board;
const repositories = { columns: columnRepository, cards: cardRepository };

interface PendingColumn {
  id: string;
  title: string;
  // Cartões ativos e arquivados, que vão embora junto com a coluna.
  active: number;
  archived: number;
}

interface DeleteColumnOptions {
  data: BoardData | null;
  // Troca o retrato do quadro na tela antes de gravar (atualização otimista).
  onDataChange: (data: BoardData) => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// "Apagar" da coluna (puxar e segurar, ou o menu "…"): alerta nativo de confirmação, que conta os
// cartões ativos e os arquivados, e apaga com desfazer. Mesmo formato de useDeleteBoard e
// useDeleteFolder.
export function useDeleteColumn({
  data,
  onDataChange,
  notifyUndoable,
  onSaveError,
}: DeleteColumnOptions) {
  const [pending, setPending] = useState<PendingColumn | null>(null);

  const request = useCallback(
    async (columnId: string) => {
      const target = data?.columns.find((item) => item.column.id === columnId);
      if (!target) return;
      const archived = await cardRepository
        .listArchivedByColumns([columnId])
        .then((cards) => cards.length)
        .catch((error: unknown) => {
          console.warn('Falha ao contar os arquivados da coluna.', error);
          return 0;
        });
      setPending({
        id: columnId,
        title: target.column.title,
        active: target.cards.length,
        archived,
      });
    },
    [data],
  );

  const cancel = useCallback(() => setPending(null), []);

  // A coluna some da tela na hora (sem esperar a gravação e a recarga); se falhar, ela volta.
  const confirm = useCallback(async () => {
    const target = pending;
    setPending(null);
    if (!target) return;
    const before = data;
    if (before) onDataChange(withColumnRemoved(before, target.id));
    try {
      const snapshot = await removeColumnWithCards(target.id, repositories);
      if (!snapshot) return;
      historyStore.record(ptBR.history.actions.deleteColumn, { kind: 'restoreColumn', snapshot });
      await notifyUndoable(text.columnDeleted);
    } catch (error: unknown) {
      console.warn('Falha ao apagar a coluna.', error);
      if (before) onDataChange(before);
      onSaveError();
    }
  }, [pending, data, onDataChange, notifyUndoable, onSaveError]);

  const confirmRequest = useMemo<DestructiveConfirmRequest | null>(() => {
    if (!pending) return null;
    const { title, active, archived } = pending;
    return {
      title: text.deleteColumnTitle(title),
      // Sem cartões, o alerta fica só com o título.
      message: active + archived > 0 ? text.deleteColumnMessage(active, archived) : undefined,
      confirmLabel: text.deleteColumnConfirm,
      cancelLabel: text.deleteColumnCancel,
    };
  }, [pending]);

  return { request, cancel, confirm, confirmRequest };
}
