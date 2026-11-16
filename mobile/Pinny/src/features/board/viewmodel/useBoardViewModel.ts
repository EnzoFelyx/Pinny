import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

import { useBoardData } from './useBoardData';
import { useBoardFilter } from './useBoardFilter';
import { useBoardMenuActions } from './useBoardMenuActions';
import { useBoardRename } from './useBoardRename';
import { useBoardSearch } from './useBoardSearch';
import { useBoardSelection } from './useBoardSelection';
import { useCardActions } from './useCardActions';
import { useColumnActions } from './useColumnActions';
import { useVisibleCards } from './useVisibleCards';

const text = ptBR.board;

// Tela do quadro: junta os dados (useBoardData), o filtro e a busca, as ações de cartão, de coluna
// e do quadro, e o modo "Selecionar". Cada parte vive no próprio hook.
export function useBoardViewModel(boardId: string) {
  const { data, columns, setData, errorText, reportSaveError, focusRequest, setFocusRequest } =
    useBoardData(boardId);
  // Filtro do quadro (só enquanto ele está aberto): todas as colunas, só os cartões que passam.
  const allCards = useMemo(
    () => (data ? data.columns.flatMap((column) => column.cards) : null),
    [data],
  );
  const filter = useBoardFilter(boardId, allCards);
  // "Buscar lembrete": vale junto com o filtro.
  const search = useBoardSearch();
  const visible = useVisibleCards(data, columns, filter.applied, search.term);
  const notifyUndoable = useUndoNotice();

  const cardActions = useCardActions({
    data,
    onDataChange: setData,
    visible,
    notifyUndoable,
    onSaveError: reportSaveError,
  });
  const columnActions = useColumnActions({
    boardId,
    data,
    onDataChange: setData,
    notifyUndoable,
    onFocusColumn: setFocusRequest,
    onSaveError: reportSaveError,
  });
  const selection = useBoardSelection({
    boardId,
    data,
    columns,
    visible,
    onDataChange: setData,
    moveCard: cardActions.moveCard,
    createColumnWithCards: columnActions.createColumnWithCards,
    notifyUndoable,
    onSaveError: reportSaveError,
  });
  const renameBoard = useBoardRename({ data, onDataChange: setData, onSaveError: reportSaveError });
  const boardMenuActions = useBoardMenuActions({
    board: data?.board,
    notifyUndoable,
    onSaveError: reportSaveError,
  });

  // Toque no cartão: no modo "Selecionar", marca ou desmarca; fora dele, abre a folha do detalhe.
  const { isSelecting, toggle } = selection.selection;
  const pressCard = useCallback(
    (cardId: string) => {
      if (isSelecting) {
        toggle(cardId);
        return;
      }
      openRoute({ pathname: '/card/[cardId]', params: { cardId } });
    },
    [isSelecting, toggle],
  );

  const openArchived = useCallback(() => {
    openRoute({ pathname: '/board/[boardId]/archived', params: { boardId } });
  }, [boardId]);

  return {
    title: data?.board.title ?? '',
    subtitle: visible.subtitle,
    columns: visible.columns,
    // Ainda sem os dados do quadro (nem erro): a tela mostra o skeleton.
    isLoading: data === null && errorText === null,
    errorText,
    focusRequest,
    ...cardActions,
    // Por último entre as ações de cartão: o soltar do arraste passa pela seleção (com a pilha,
    // leva todos os marcados), e substitui o moveCard simples.
    ...selection,
    pressCard,
    openArchived,
    renameBoard,
    ...boardMenuActions,
    filter,
    search,
    // A busca sobrou com um cartão só: o quadro rola até ele. Com dois ou mais (ou nenhum), fica
    // onde está.
    searchMatch: visible.singleMatch,
    // Leitor de tela: quantos cartões a busca encontrou (o subtítulo some durante a busca).
    searchResultText: search.term ? text.search.results(visible.visibleCount) : null,
    goBack: router.back,
    ...columnActions,
  };
}

export type BoardViewModel = ReturnType<typeof useBoardViewModel>;
