import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { ptBR } from '@/i18n/pt-BR';

import { type ArchivedCardsData, loadArchivedCards } from '../model/archivedCards';
import { toCardItem } from './boardItems';

const text = ptBR.board.archived;

// Tela "Arquivados" (… do quadro): por enquanto, só a lista dos cartões arquivados numa coluna.
// Desarquivar e o visual final vêm com o desenho no Figma.
export function useArchivedCardsViewModel(boardId: string) {
  const [data, setData] = useState<ArchivedCardsData | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Carrega ao abrir e recarrega a cada mudança no banco (ex.: desfazer um arquivamento).
  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadArchivedCards(boardId)
        .then((result) => {
          if (!isActive) return;
          if (!result) {
            router.back();
            return;
          }
          setData(result);
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar os arquivados.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [boardId]);

  const now = new Date();
  const cards = (data?.cards ?? []).map((card) => toCardItem(card, now));

  return {
    title: text.title,
    subtitle: data ? data.board.title : '',
    isLoading: data === null && errorText === null,
    errorText,
    columnTitle: text.columnTitle,
    cards,
    emptyMessage: text.empty,
    goBack: router.back,
  };
}
