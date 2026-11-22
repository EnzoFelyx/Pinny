import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { type CardDetail, loadCardDetail } from '@/features/card/model/cardDetail';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { toArchivedCardSheet } from './archivedCardSheet';
import { useCardDelete } from './useCardDelete';
import { useUnarchiveCards } from './useUnarchiveCards';

const text = ptBR.board.archived.sheet;

// Folha "Cartão arquivado" (tocar no cartão na tela "Arquivados"): só leitura, com "Desarquivar em
// <coluna>" e "Apagar". Fecha sozinha quando o cartão deixa de estar arquivado ou some (depois de
// desarquivar ou apagar, ou se outra tela mudar o cartão).
export function useArchivedCardViewModel(cardId: string) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  // A folha já está fechando: a recarga não volta de novo.
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
          if (!result || result.card.archivedAt === null) {
            close();
            return;
          }
          setDetail(result);
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar o cartão arquivado.', error);
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

  const sheet = useMemo(() => (detail ? toArchivedCardSheet(detail, new Date()) : null), [detail]);
  const reportSaveError = useCallback(() => setErrorText(ptBR.common.saveError), []);

  const unarchive = useUnarchiveCards({
    boardId: sheet?.boardId ?? '',
    onDone: close,
    notifyUndoable,
    onSaveError: reportSaveError,
  });
  const titleOf = useCallback(() => detail?.card.title, [detail]);
  const { request, deleteRequest, confirmDelete, cancelDelete } = useCardDelete({
    titleOf,
    onDone: close,
    notifyUndoable,
    onSaveError: reportSaveError,
  });

  return {
    sheet,
    errorText,
    unarchive: useCallback(() => unarchive([cardId]), [unarchive, cardId]),
    requestDelete: useCallback(() => request([cardId]), [request, cardId]),
    deleteRequest,
    confirmDelete,
    cancelDelete,
  };
}
