import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UndoOperation } from '@/features/history/model/actionHistory';
import { historyStore } from '@/features/history/model/historyStore';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';
import { formatShortDate } from '@/utils/date';
import { formatFileSize } from '@/utils/text';

import { attachmentRepository } from '../model/attachmentRepository';
import type { Attachment } from '../model/card.schema';
import { addAttachment, removeAttachment, setCardCover } from '../model/cardEdits';
import { photoService, type SavedPhoto } from '../model/photoService';
import { cameraPermissionSignal } from './cameraPermissionSignal';

const text = ptBR.card.photos;
const actions = ptBR.history.actions;

// Uma foto pronta para a lista do cartão.
export interface PhotoItemView {
  id: string;
  thumbnailUri: string;
  title: string;
  detail: string;
  accessibilityLabel: string;
  // A foto que aparece no post-it do quadro.
  isCover: boolean;
}

interface CardPhotosOptions {
  cardId: string;
  attachments: readonly Attachment[];
  notifyUndoable: (message: string) => Promise<void>;
  onError: () => void;
}

const deleteRequestText: Omit<DestructiveConfirmRequest, 'title'> = {
  message: text.deleteMessage,
  confirmLabel: text.deleteConfirm,
  cancelLabel: ptBR.history.cancel,
};

const cameraDeniedRequest: DestructiveConfirmRequest = {
  title: text.cameraDeniedTitle,
  message: text.cameraDeniedMessage,
  confirmLabel: text.openSettings,
  cancelLabel: text.notNow,
  confirmStyle: 'default',
};

function toPhotoItem(attachment: Attachment): PhotoItemView {
  const date = formatShortDate(new Date(attachment.createdAt));
  const size = photoService.sizeOf(attachment.uri);
  return {
    id: attachment.id,
    thumbnailUri: photoService.uriOf(attachment.thumbnailUri),
    title: text.itemTitle(date),
    detail: size === null ? '' : text.itemDetail(formatFileSize(size)),
    accessibilityLabel: attachment.isCover
      ? `${text.coverA11y}. ${text.itemA11y(date)}`
      : text.itemA11y(date),
    isCover: attachment.isCover,
  };
}

// Fotos da tela do cartão. Câmera: a permissão é pedida só no primeiro uso, depois da folha que
// explica o porquê (CLAUDE.md, seção 12, regra 6); negada antes, o alerta leva aos Ajustes, e o
// resto do app continua funcionando. Galeria: sem permissão (o iOS só entrega as fotos escolhidas).
export function useCardPhotos({ cardId, attachments, notifyUndoable, onError }: CardPhotosOptions) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isCameraDenied, setIsCameraDenied] = useState(false);
  // A folha da câmera liberou o acesso: a câmera abre quando a tela do cartão voltar à frente.
  const isCameraPendingRef = useRef(false);

  // Anexa as fotos já guardadas numa ação só no histórico (desfazer tira todas).
  const attach = useCallback(
    async (photos: readonly SavedPhoto[]) => {
      if (photos.length === 0) return;
      const operations: UndoOperation[] = [];
      for (const photo of photos) {
        operations.push(
          await addAttachment(
            { cardId, uri: photo.path, thumbnailUri: photo.thumbnailPath },
            attachmentRepository,
          ),
        );
      }
      const [single] = operations;
      historyStore.record(
        actions.addPhoto,
        operations.length === 1 && single ? single : { kind: 'sequence', operations },
      );
      await notifyUndoable(text.added(photos.length));
    },
    [cardId, notifyUndoable],
  );

  const run = useCallback(
    async (capture: () => Promise<SavedPhoto[] | null>) => {
      try {
        const photos = await capture();
        if (photos) await attach(photos);
      } catch (error: unknown) {
        console.warn('Falha ao anexar a foto.', error);
        onError();
      }
    },
    [attach, onError],
  );

  const capture = useCallback(
    () =>
      run(async () => {
        const photo = await photoService.takePhoto();
        return photo ? [photo] : null;
      }),
    [run],
  );

  const takePhoto = useCallback(async () => {
    try {
      const access = await photoService.cameraAccess();
      if (access === 'granted') await capture();
      else if (access === 'denied') setIsCameraDenied(true);
      else openRoute({ pathname: '/card/[cardId]/camera-permission', params: { cardId } });
    } catch (error: unknown) {
      console.warn('Falha ao ler a permissão da câmera.', error);
      onError();
    }
  }, [capture, cardId, onError]);

  const pickPhotos = useCallback(() => run(() => photoService.pickPhotos()), [run]);

  useEffect(
    () =>
      cameraPermissionSignal.subscribe((isGranted) => {
        isCameraPendingRef.current = isGranted;
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      if (!isCameraPendingRef.current) return;
      isCameraPendingRef.current = false;
      void capture();
    }, [capture]),
  );

  const openPhoto = useCallback(
    (attachmentId: string) => {
      openRoute({
        pathname: '/card/[cardId]/photo/[attachmentId]',
        params: { cardId, attachmentId },
      });
    },
    [cardId],
  );

  const confirmDelete = useCallback(async () => {
    const attachmentId = deleteTargetId;
    setDeleteTargetId(null);
    if (!attachmentId) return;
    try {
      const undo = await removeAttachment(attachmentId, attachmentRepository);
      if (!undo) return;
      historyStore.record(actions.deletePhoto, undo);
      await notifyUndoable(text.deleted);
    } catch (error: unknown) {
      console.warn('Falha ao apagar a foto.', error);
      onError();
    }
  }, [deleteTargetId, notifyUndoable, onError]);
  const cancelDelete = useCallback(() => setDeleteTargetId(null), []);

  // Capa do post-it: uma foto por cartão (null = tirar a capa). Entra no histórico.
  const changeCover = useCallback(
    async (attachmentId: string | null) => {
      try {
        const undo = await setCardCover(cardId, attachmentId, attachmentRepository);
        if (undo) historyStore.record(actions.setCover, undo);
      } catch (error: unknown) {
        console.warn('Falha ao trocar a capa do cartão.', error);
        onError();
      }
    },
    [cardId, onError],
  );
  const setCover = useCallback((attachmentId: string) => changeCover(attachmentId), [changeCover]);
  const removeCover = useCallback(() => changeCover(null), [changeCover]);

  const openSettings = useCallback(async () => {
    setIsCameraDenied(false);
    try {
      await photoService.openSettings();
    } catch (error: unknown) {
      console.warn('Falha ao abrir os Ajustes.', error);
      onError();
    }
  }, [onError]);
  const dismissCameraDenied = useCallback(() => setIsCameraDenied(false), []);

  return {
    title: text.title,
    items: attachments.map(toPhotoItem),
    takePhoto,
    pickPhotos,
    openPhoto,
    setCover,
    removeCover,
    requestDelete: setDeleteTargetId,
    deleteRequest: deleteTargetId ? { title: text.deleteTitle, ...deleteRequestText } : null,
    confirmDelete,
    cancelDelete,
    cameraDeniedRequest: isCameraDenied ? cameraDeniedRequest : null,
    openSettings,
    dismissCameraDenied,
  };
}

export type CardPhotosViewModel = ReturnType<typeof useCardPhotos>;
