import { useCallback, useEffect, useMemo, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { cardRepository } from '@/features/card/model/cardRepository';
import { createSampleCard } from '@/features/dev/model/devDataService';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, loadBoard, withCardMoved } from '../model/boardData';
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

  // Intenção final do arraste (ou da ação de acessibilidade): o cartão vai para toIndex na coluna.
  const moveCard = useCallback(
    async (columnId: string, cardId: string, toIndex: number) => {
      if (!data) return;
      const moved = withCardMoved(data, columnId, cardId, toIndex);
      if (!moved) return;

      setData(moved.data);
      try {
        await cardRepository.move(cardId, columnId, toPlacement(moved.orderedIds, cardId));
        historyStore.record(ptBR.history.actions.moveCard, {
          kind: 'moveCard',
          cardId,
          columnId,
          position: moved.previousPosition,
        });
        await notifyUndoable(text.cardMoved);
      } catch (error: unknown) {
        console.warn('Falha ao mover o cartão.', error);
        setData(data);
        setErrorText(ptBR.common.saveError);
      }
    },
    [data, notifyUndoable],
  );

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
    addCard,
    // O menu da coluna chega na etapa 6.3. Por enquanto não faz nada.
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
