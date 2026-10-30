import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { createSampleCard } from '@/features/dev/model/devDataService';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, loadBoard, withCardMoved } from '../model/boardData';
import { moveCardWithHistory } from '../model/cardMove';
import { toPlacement } from '../model/reorder';
import { toColumnItem } from './boardItems';

const text = ptBR.board;

function noop() {}

export function useBoardViewModel(boardId: string) {
  const [data, setData] = useState<BoardData | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const notifyUndoable = useUndoNotice();
  const [columnToDelete, setColumnToDelete] = useState<{ id: string; title: string } | null>(null);

  // Carrega ao abrir e recarrega a cada mudança no banco (inclusive as feitas por esta tela).
  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadBoard(boardId)
        .then((result) => {
          if (!isActive) return;
          setData(result);
          setErrorText(null);
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
  }, [boardId]);

  const columns = useMemo(() => {
    const now = new Date();
    return (data?.columns ?? []).map((column) => toColumnItem(column, now));
  }, [data]);

  const cardCount = columns.reduce((total, column) => total + column.cards.length, 0);

  // Intenção final do arraste (ou das ações de acessibilidade): o cartão vai para toIndex na
  // coluna de destino, a mesma ou outra.
  const moveCard = useCallback(
    async (cardId: string, toColumnId: string, toIndex: number) => {
      if (!data) return;
      const moved = withCardMoved(data, cardId, toColumnId, toIndex);
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
    [data, notifyUndoable],
  );

  // Alternativa sem gesto (CLAUDE.md, regra 15): leva o cartão ao topo da coluna vizinha e devolve
  // o texto para o leitor de tela anunciar. null = não há coluna desse lado.
  const moveCardToAdjacentColumn = useCallback(
    (cardId: string, step: -1 | 1): string | null => {
      const columnIndex = columns.findIndex((column) =>
        column.cards.some((card) => card.id === cardId),
      );
      const target = columns[columnIndex + step];
      if (columnIndex < 0 || !target) return null;
      void moveCard(cardId, target.id, 0);
      return text.movedToColumn(target.title, 1, target.cards.length + 1);
    },
    [columns, moveCard],
  );

  const openMoveCard = useCallback((cardId: string) => {
    router.push({ pathname: '/card/[cardId]/move', params: { cardId } });
  }, []);

  // Provisório até a etapa 7: cria um cartão de exemplo no fim da coluna.
  const addCard = useCallback(async (columnId: string) => {
    try {
      const card = await createSampleCard(columnId);
      historyStore.record(ptBR.history.actions.createCard, {
        kind: 'deleteCard',
        cardId: card.id,
      });
    } catch (error: unknown) {
      console.warn('Falha ao criar o cartão.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, []);

  return {
    title: data?.board.title ?? '',
    subtitle: data ? text.subtitle(data.folderTitle, cardCount) : '',
    columns,
    errorText,
    moveCard,
    moveCardToAdjacentColumn,
    openMoveCard,
    addCard,
    goBack: router.back,
    // Os menus do quadro e da coluna chegam numa etapa futura. Por enquanto não fazem nada.
    openBoardMenu: noop,
    openColumnMenu: noop,
    // Puxar e segurar a coluna pede a confirmação. Por enquanto só visual: os dois botões
    // fecham o alerta, e a exclusão de verdade chega na etapa 6.3.
    columnToDelete,
    requestDeleteColumn: useCallback(
      (columnId: string) => {
        const target = data?.columns.find((item) => item.column.id === columnId);
        if (target) setColumnToDelete({ id: columnId, title: target.column.title });
      },
      [data],
    ),
    closeDeleteColumn: useCallback(() => setColumnToDelete(null), []),
  };
}
