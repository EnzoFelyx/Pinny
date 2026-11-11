import { useCallback, useMemo, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';

import { removeCards } from '../model/cardBatch';

const text = ptBR.board.selection;

interface CardDeleteOptions {
  // Título do cartão, para o alerta de apagar um só.
  titleOf: (cardId: string) => string | undefined;
  // Depois de apagar (ex.: fechar o modo de seleção).
  onDone: () => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

interface PendingDelete {
  ids: readonly string[];
  // Título próprio do alerta (ex.: "Apagar os 5 cartões arquivados?").
  title?: string;
}

// Apagar vários cartões com o alerta nativo de confirmação: uma transação só, uma ação só no
// histórico ("Apagar Cartões") e o aviso de desfazer. Usado pela seleção do quadro e pelos
// Arquivados.
export function useCardDelete({ titleOf, onDone, notifyUndoable, onSaveError }: CardDeleteOptions) {
  const [pending, setPending] = useState<PendingDelete | null>(null);

  const request = useCallback((ids: readonly string[], title?: string) => {
    if (ids.length > 0) setPending({ ids: [...ids], title });
  }, []);

  const deleteRequest = useMemo<DestructiveConfirmRequest | null>(() => {
    if (!pending) return null;
    const { ids } = pending;
    const [first] = ids;
    const single = ids.length === 1 && first ? titleOf(first) : undefined;
    return {
      title:
        pending.title ?? (single ? text.deleteOneTitle(single) : text.deleteManyTitle(ids.length)),
      message: text.deleteMessage(ids.length),
      confirmLabel: text.deleteConfirm,
      cancelLabel: text.cancel,
    };
  }, [pending, titleOf]);

  const confirmDelete = useCallback(async () => {
    const ids = pending?.ids;
    setPending(null);
    if (!ids) return;
    try {
      const undo = await removeCards(ids, cardRepository);
      historyStore.record(ptBR.history.actions.deleteCards, undo);
      onDone();
      await notifyUndoable(text.cardsDeleted(ids.length));
    } catch (error: unknown) {
      console.warn('Falha ao apagar os cartões.', error);
      onSaveError();
    }
  }, [pending, onDone, notifyUndoable, onSaveError]);

  const cancelDelete = useCallback(() => setPending(null), []);

  return { request, deleteRequest, confirmDelete, cancelDelete };
}
