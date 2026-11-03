import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { createSampleCard } from '@/features/dev/model/devDataService';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, emptyColumnIdsOf, loadBoard, withCardMoved } from '../model/boardData';
import { moveCardWithHistory } from '../model/cardMove';
import { assignEmptyVariants, type EmptyVariantMap } from '../model/emptyVariants';
import { toPlacement } from '../model/reorder';
import { type BoardColumnItem, toColumnItems } from './boardItems';
import { useBoardFilter } from './useBoardFilter';
import { useBoardRename } from './useBoardRename';
import { useColumnActions } from './useColumnActions';
import { useVisibleCards } from './useVisibleCards';

const text = ptBR.board;

export function useBoardViewModel(boardId: string) {
  // Dados do quadro, o estado vazio sorteado de cada coluna vazia e as colunas prontas para exibir,
  // atualizados juntos: a coluna que esvazia já aparece com a variação dela, quem já tinha uma
  // continua com a mesma, e as colunas e cartões que não mudaram mantêm o mesmo objeto (não são
  // redesenhados).
  const [board, setBoard] = useState<{
    data: BoardData | null;
    emptyVariants: EmptyVariantMap;
    columns: BoardColumnItem[];
  }>({ data: null, emptyVariants: {}, columns: [] });
  const { data, columns } = board;
  const setData = useCallback((next: BoardData | null) => {
    setBoard((current) => {
      const emptyVariants = assignEmptyVariants(emptyColumnIdsOf(next), current.emptyVariants);
      return {
        data: next,
        emptyVariants,
        columns: toColumnItems(next, emptyVariants, current.columns, new Date()),
      };
    });
  }, []);
  // Filtro do quadro (só enquanto ele está aberto): todas as colunas, só os cartões que passam.
  const filter = useBoardFilter(boardId, data);
  const visible = useVisibleCards(data, columns, filter.applied);
  const [errorText, setErrorText] = useState<string | null>(null);
  const notifyUndoable = useUndoNotice();
  // Coluna que acabou de aparecer (criada ou devolvida pelo "Desfazer"): o quadro rola até ela.
  // Um objeto novo a cada pedido, para a mesma coluna poder ser focada de novo (desfazer e refazer).
  const [focusRequest, setFocusRequest] = useState<{ columnId: string } | null>(null);

  // Carrega ao abrir e recarrega a cada mudança no banco (inclusive as feitas por esta tela).
  useEffect(() => {
    let isActive = true;
    // Colunas da última carga (null = ainda não carregou: na abertura, nada é "novo").
    let knownColumnIds: ReadonlySet<string> | null = null;
    const reload = () => {
      loadBoard(boardId)
        .then((result) => {
          if (!isActive) return;
          const ids = result?.columns.map((item) => item.column.id) ?? [];
          const added = knownColumnIds ? ids.find((id) => !knownColumnIds?.has(id)) : undefined;
          knownColumnIds = new Set(ids);
          setData(result);
          setErrorText(null);
          if (added) setFocusRequest({ columnId: added });
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar o quadro.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };

    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [boardId, setData]);

  // Intenção final do arraste (ou das ações de acessibilidade): o cartão vai para toIndex na
  // coluna de destino, a mesma ou outra.
  const moveCard = useCallback(
    async (cardId: string, toColumnId: string, toIndex: number) => {
      if (!data) return;
      const moved = withCardMoved(
        data,
        cardId,
        toColumnId,
        visible.toFullIndex(cardId, toColumnId, toIndex),
      );
      if (!moved) return;

      setData(moved.data);
      try {
        await moveCardWithHistory(
          cardId,
          toColumnId,
          toPlacement(moved.orderedIds, cardId),
          { columnId: moved.previousColumnId, position: moved.previousPosition },
          ptBR.history.actions.moveCard,
        );
        await notifyUndoable(text.cardMoved);
      } catch (error: unknown) {
        console.warn('Falha ao mover o cartão.', error);
        setData(data);
        setErrorText(ptBR.common.saveError);
      }
    },
    [data, notifyUndoable, setData, visible],
  );

  // Alternativa sem gesto (CLAUDE.md, regra 15): leva o cartão ao topo da coluna vizinha e devolve
  // o texto para o leitor de tela anunciar. null = não há coluna desse lado.
  const moveCardToAdjacentColumn = useCallback(
    (cardId: string, step: -1 | 1): string | null => {
      const shown = visible.columns;
      const columnIndex = shown.findIndex((column) =>
        column.visibleCards.some((card) => card.id === cardId),
      );
      const target = shown[columnIndex + step];
      if (columnIndex < 0 || !target) return null;
      void moveCard(cardId, target.id, 0);
      return text.movedToColumn(target.title, 1, target.visibleCards.length + 1);
    },
    [visible.columns, moveCard],
  );

  const openMoveCard = useCallback((cardId: string) => {
    router.push({ pathname: '/card/[cardId]/move', params: { cardId } });
  }, []);

  // Provisório até a etapa 7: cria um cartão de exemplo no fim da coluna. Se o filtro o esconder,
  // avisa (senão pareceria que nada aconteceu).
  const addCard = useCallback(
    async (columnId: string) => {
      try {
        const card = await createSampleCard(columnId);
        historyStore.record(ptBR.history.actions.createCard, {
          kind: 'deleteCard',
          cardId: card.id,
        });
        if (visible.hidesNewCard(card)) snackbarStore.show(text.filter.newCardHidden);
      } catch (error: unknown) {
        console.warn('Falha ao criar o cartão.', error);
        setErrorText(ptBR.common.saveError);
      }
    },
    [visible],
  );

  const reportSaveError = useCallback(() => setErrorText(ptBR.common.saveError), []);
  const renameBoard = useBoardRename({ data, onDataChange: setData, onSaveError: reportSaveError });
  const columnActions = useColumnActions({
    boardId,
    data,
    onDataChange: setData,
    notifyUndoable,
    onFocusColumn: setFocusRequest,
    onSaveError: reportSaveError,
  });

  return {
    title: data?.board.title ?? '',
    subtitle: visible.subtitle,
    columns: visible.columns,
    // Ainda sem os dados do quadro (nem erro): a tela mostra o skeleton.
    isLoading: data === null && errorText === null,
    errorText,
    focusRequest,
    moveCard,
    moveCardToAdjacentColumn,
    openMoveCard,
    addCard,
    renameBoard,
    filter,
    goBack: router.back,
    ...columnActions,
  };
}
