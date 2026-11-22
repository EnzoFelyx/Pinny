import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { archiveCards } from '@/features/board/model/cardBatch';
import { toDeadline } from '@/features/board/viewmodel/boardItems';
import { useCardDelete } from '@/features/board/viewmodel/useCardDelete';
import { subscribeToDataChanges } from '@/db/changes';
import type { UndoOperation } from '@/features/history/model/actionHistory';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

import type { DeadlineStatus } from '../model/card.types';
import { type CardDetail, loadCardDetail } from '../model/cardDetail';
import type { DueDateBlockValue } from '../view/components/DueDateBlock';
import { updateCardFields } from '../model/cardEdits';
import { cardRepository } from '../model/cardRepository';
import { dueDateParts } from './dueDateText';
import { useCardChecklist } from './useCardChecklist';
import { useCardPhotos } from './useCardPhotos';

const text = ptBR.card.detail;

// A tela fecha pela recarga (o cartão sumiu), não pelo fim do apagar.
function noop() {}

// Bloco do prazo: "Hoje, 18 mai · 10:00" no tom do estado (null = sem prazo, "Adicionar data e
// horário"). Concluído sem prazo também não tem bloco.
function toDueDateBlock(
  dueAt: string | null,
  status: DeadlineStatus,
  now: Date,
): DueDateBlockValue | null {
  const due = dueAt ? new Date(dueAt) : null;
  if (!due || Number.isNaN(due.getTime())) return null;
  const { day, time } = dueDateParts(due, now);
  return {
    text: text.dueValue(day, time),
    accessibilityLabel: text.dueA11y(day, time, ptBR.card.deadlineStatus[status]),
    status,
  };
}

// Tela do cartão: carrega e recarrega a cada mudança no banco. Cada edição grava na
// hora (sem botão "Salvar") e entra no histórico (decisão do autor, 2026-11-13).
export function useCardDetailViewModel(cardId: string) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  // A tela já está fechando (arquivou ou o cartão sumiu): a recarga não volta de novo.
  const isClosingRef = useRef(false);
  const notifyUndoable = useUndoNotice();

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    router.back();
  }, []);

  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadCardDetail(cardId)
        .then((result) => {
          if (!isActive) return;
          // Apagado (aqui ou pelo desfazer em outra tela): a tela fecha.
          if (!result) {
            close();
            return;
          }
          setDetail(result);
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar o cartão.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [cardId, close]);

  const reportSaveError = useCallback(() => setErrorText(ptBR.common.saveError), []);
  const reportPhotoError = useCallback(() => setErrorText(ptBR.card.photos.saveError), []);

  // Grava uma edição e registra o desfazer (null = nada mudou).
  const runEdit = useCallback(
    async (actionName: string, edit: () => Promise<UndoOperation | null>) => {
      try {
        const undo = await edit();
        if (undo) historyStore.record(actionName, undo);
      } catch (error: unknown) {
        console.warn('Falha ao salvar o cartão.', error);
        reportSaveError();
      }
    },
    [reportSaveError],
  );

  // Título vazio volta ao anterior (o campo mostra de novo o que estava gravado).
  const renameTitle = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      void runEdit(ptBR.history.actions.editCard, () =>
        updateCardFields(cardId, { title: trimmed }, cardRepository),
      );
    },
    [cardId, runEdit],
  );
  const changeDescription = useCallback(
    (description: string) => {
      void runEdit(ptBR.history.actions.editCard, () =>
        updateCardFields(cardId, { description: description.trim() }, cardRepository),
      );
    },
    [cardId, runEdit],
  );

  // "+" e os chips de etiqueta e prioridade: abrem a folha "Prioridade e etiquetas".
  const openLabels = useCallback(() => {
    openRoute({ pathname: '/card/[cardId]/labels', params: { cardId } });
  }, [cardId]);

  const openDueDate = useCallback(() => {
    openRoute({ pathname: '/card/[cardId]/due-date', params: { cardId } });
  }, [cardId]);

  const openMove = useCallback(() => {
    openRoute({ pathname: '/card/[cardId]/move', params: { cardId } });
  }, [cardId]);

  // Arquivar: some do quadro (com desfazer) e a tela fecha.
  const archive = useCallback(async () => {
    try {
      const undo = await archiveCards([cardId], cardRepository);
      historyStore.record(ptBR.history.actions.archiveCard, undo);
      close();
      await notifyUndoable(text.archived);
    } catch (error: unknown) {
      console.warn('Falha ao arquivar o cartão.', error);
      reportSaveError();
    }
  }, [cardId, close, notifyUndoable, reportSaveError]);

  // Apagar: alerta de confirmação; ao apagar, a recarga percebe e a tela fecha.
  const cardTitle = detail?.card.title;
  const titleOf = useCallback(() => cardTitle, [cardTitle]);
  const cardDelete = useCardDelete({
    titleOf,
    onDone: noop,
    notifyUndoable,
    onSaveError: reportSaveError,
  });
  const { request: requestCardDelete } = cardDelete;
  const requestDelete = useCallback(() => requestCardDelete([cardId]), [requestCardDelete, cardId]);

  const checklist = useCardChecklist({ cardId, items: detail?.checklist ?? [], runEdit });
  const photos = useCardPhotos({
    cardId,
    attachments: detail?.attachments ?? [],
    notifyUndoable,
    onError: reportPhotoError,
  });

  const now = new Date();
  const card = detail?.card;
  const deadline = card ? toDeadline(card, now) : undefined;

  return {
    isLoading: detail === null && errorText === null,
    errorText,
    breadcrumb: detail ? text.breadcrumb(detail.folderTitle, detail.column.title) : '',
    title: card?.title ?? '',
    description: card?.description ?? '',
    labels: (detail?.labels ?? []).map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })),
    priority: card?.priority ?? undefined,
    deadline,
    dueDate: card && deadline ? toDueDateBlock(card.dueAt, deadline.status, now) : null,
    openDueDate,
    checklist,
    photos,
    statusText: detail?.column.title ?? '',
    statusA11y: detail ? text.statusA11y(detail.column.title) : '',
    renameTitle,
    changeDescription,
    openLabels,
    openMove,
    archive,
    requestDelete,
    goBack: router.back,
    deleteRequest: cardDelete.deleteRequest,
    confirmDelete: cardDelete.confirmDelete,
    cancelDelete: cardDelete.cancelDelete,
  };
}

export type CardDetailViewModel = ReturnType<typeof useCardDetailViewModel>;
