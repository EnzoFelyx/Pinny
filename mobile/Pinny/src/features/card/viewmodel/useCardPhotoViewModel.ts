import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { formatWeekdayAndDate } from '@/utils/date';

import { attachmentRepository } from '../model/attachmentRepository';
import type { Attachment } from '../model/card.schema';
import { removeAttachment } from '../model/cardEdits';
import { photoService } from '../model/photoService';

const text = ptBR.card.photos;

const deleteRequest: DestructiveConfirmRequest = {
  title: text.deleteTitle,
  message: text.deleteMessage,
  confirmLabel: text.deleteConfirm,
  cancelLabel: ptBR.history.cancel,
};

// Tela da foto anexada: a foto inteira e, no "…", Apagar (com desfazer). Fecha sozinha se a foto
// sumir (ex.: o cartão foi apagado).
export function useCardPhotoViewModel(attachmentId: string) {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isDeleteAsked, setIsDeleteAsked] = useState(false);
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
      attachmentRepository
        .getById(attachmentId)
        .then((result) => {
          if (!isActive) return;
          if (!result) close();
          else setAttachment(result);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao abrir a foto.', error);
          if (isActive) setErrorText(ptBR.card.detail.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [attachmentId, close]);

  const confirmDelete = useCallback(async () => {
    setIsDeleteAsked(false);
    try {
      const undo = await removeAttachment(attachmentId, attachmentRepository);
      if (!undo) return;
      historyStore.record(ptBR.history.actions.deletePhoto, undo);
      close();
      await notifyUndoable(text.deleted);
    } catch (error: unknown) {
      console.warn('Falha ao apagar a foto.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [attachmentId, close, notifyUndoable]);

  const date = attachment ? formatWeekdayAndDate(new Date(attachment.createdAt)) : '';

  return {
    isLoading: attachment === null && errorText === null,
    errorText,
    title: text.viewerTitle,
    subtitle: date,
    photoUri: attachment ? photoService.uriOf(attachment.uri) : null,
    photoA11y: text.viewerA11y(date),
    goBack: router.back,
    requestDelete: () => setIsDeleteAsked(true),
    deleteRequest: isDeleteAsked ? deleteRequest : null,
    confirmDelete,
    cancelDelete: () => setIsDeleteAsked(false),
  };
}
