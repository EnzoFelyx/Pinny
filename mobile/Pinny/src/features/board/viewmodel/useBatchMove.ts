import { useCallback, useRef, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, withCardsMoved } from '../model/boardData';
import { moveCards } from '../model/cardBatch';
import { labelRepository } from '../model/labelRepository';

interface BatchMoveOptions {
  data: BoardData | null;
  // Movimento de um cartão só (arraste normal e ações do VoiceOver).
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => Promise<void>;
  // Folha "Nova coluna" com os cartões soltos na coluna "Adicionar coluna".
  createColumnWithCards: (cardIds: readonly string[]) => void;
  // Marcados na ordem em que foram marcados (é a ordem que vale na coluna nova).
  selectionOrder: readonly string[];
  onDataChange: (data: BoardData) => void;
  // Selecionados na ordem do quadro.
  selectedIds: readonly string[];
  // Vaga contada entre os cartões à mostra para o índice na coluna completa, sem os do lote.
  toFullIndex: (cardIds: readonly string[], toColumnId: string, toIndex: number) => number;
  // Fecha o modo de seleção.
  onDone: () => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Soltar a pilha do arraste em lote: todos os selecionados vão juntos para a vaga, o segurado
// primeiro e os outros na ordem do quadro. Atualização otimista, uma ação só no histórico,
// fecha o modo de seleção e avisa com o desfazer. Sem pilha, o soltar é o movimento de um cartão.
export function useBatchMove({
  data,
  moveCard,
  createColumnWithCards,
  selectionOrder,
  onDataChange,
  selectedIds,
  toFullIndex,
  onDone,
  notifyUndoable,
  onSaveError,
}: BatchMoveOptions) {
  // Cartão segurado com a pilha (null = arraste normal): o soltar dele leva o lote inteiro.
  const batchHeldId = useRef<string | null>(null);
  // Pilha no ar: as bolinhas de seleção dos cartões somem até soltar.
  const [isBatchDragging, setIsBatchDragging] = useState(false);
  const startBatchDrag = useCallback((heldId: string) => {
    batchHeldId.current = heldId;
    setIsBatchDragging(true);
  }, []);
  const endBatchDrag = useCallback(() => {
    batchHeldId.current = null;
    setIsBatchDragging(false);
  }, []);

  const moveSelectionTo = useCallback(
    async (heldId: string, toColumnId: string, toIndex: number) => {
      if (!data) return;
      const ids = [heldId, ...selectedIds.filter((id) => id !== heldId)];
      const moved = withCardsMoved(data, ids, toColumnId, toFullIndex(ids, toColumnId, toIndex));
      const column = data.columns.find((item) => item.column.id === toColumnId)?.column;
      if (!moved || !column) return;

      onDataChange(moved.data);
      onDone();
      try {
        const undo = await moveCards(
          ids,
          { columnId: toColumnId, toBoardId: null, nextId: moved.nextId },
          { cards: cardRepository, labels: labelRepository },
        );
        historyStore.record(ptBR.history.actions.moveCards, undo);
        await notifyUndoable(ptBR.board.selection.cardsMoved(ids.length, column.title));
      } catch (error: unknown) {
        console.warn('Falha ao mover os cartões.', error);
        onDataChange(data);
        onSaveError();
      }
    },
    [data, onDataChange, selectedIds, toFullIndex, onDone, notifyUndoable, onSaveError],
  );

  // Intenção final do arraste: com a pilha, move o lote; sem ela, só o cartão.
  const dropCard = useCallback(
    async (cardId: string, toColumnId: string, toIndex: number) => {
      if (batchHeldId.current !== cardId) return moveCard(cardId, toColumnId, toIndex);
      batchHeldId.current = null;
      setIsBatchDragging(false);
      return moveSelectionTo(cardId, toColumnId, toIndex);
    },
    [moveCard, moveSelectionTo],
  );

  // Solto na coluna "Adicionar coluna": com a pilha, todos os marcados vão para a coluna nova, na
  // ordem em que foram marcados (pedido do autor); sem ela, só o cartão.
  const dropOnNewColumn = useCallback(
    (cardId: string) => {
      const isBatch = batchHeldId.current === cardId;
      createColumnWithCards(isBatch ? selectionOrder : [cardId]);
    },
    [createColumnWithCards, selectionOrder],
  );

  return { dropCard, dropOnNewColumn, startBatchDrag, endBatchDrag, isBatchDragging };
}
