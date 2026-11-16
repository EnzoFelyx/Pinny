import { useCallback } from 'react';

import { createSampleCard } from '@/features/dev/model/devDataService';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

import { type BoardData, withCardMoved } from '../model/boardData';
import { moveCardWithHistory } from '../model/cardMove';
import { toPlacement } from '../model/reorder';
import type { VisibleCards } from './useVisibleCards';

const text = ptBR.board;

interface CardActionsOptions {
  data: BoardData | null;
  // Troca o retrato do quadro na tela antes de gravar (atualização otimista).
  onDataChange: (data: BoardData) => void;
  visible: VisibleCards;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Ações sobre um cartão do quadro: mover (arraste e alternativas sem gesto), abrir a folha
// "Mover para…" e criar (provisório até a etapa 7).
export function useCardActions({
  data,
  onDataChange,
  visible,
  notifyUndoable,
  onSaveError,
}: CardActionsOptions) {
  // Intenção final do arraste (ou das ações de acessibilidade): o cartão vai para toIndex na
  // coluna de destino, a mesma ou outra. A nova ordem aparece na hora; se a gravação falhar, a
  // antiga volta.
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

      onDataChange(moved.data);
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
        onDataChange(data);
        onSaveError();
      }
    },
    [data, onDataChange, visible, notifyUndoable, onSaveError],
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
    openRoute({ pathname: '/card/[cardId]/move', params: { cardId } });
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
        onSaveError();
      }
    },
    [visible, onSaveError],
  );

  return { moveCard, moveCardToAdjacentColumn, openMoveCard, addCard };
}
