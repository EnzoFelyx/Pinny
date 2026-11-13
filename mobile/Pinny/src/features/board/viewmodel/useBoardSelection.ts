import { useCallback, useMemo } from 'react';

import type { BoardData } from '../model/boardData';
import type { BoardColumnItem } from './boardItems';
import { useBatchMove } from './useBatchMove';
import { useCardBatchActions } from './useCardBatchActions';
import { useCardSelection } from './useCardSelection';
import type { VisibleCards } from './useVisibleCards';

interface BoardSelectionOptions {
  boardId: string;
  data: BoardData | null;
  // Todas as colunas, com os cartões escondidos pelo filtro (a ordem do quadro).
  columns: readonly BoardColumnItem[];
  visible: VisibleCards;
  onDataChange: (data: BoardData) => void;
  // Arraste normal de um cartão (sem a pilha).
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => Promise<void>;
  // Folha "Nova coluna" com os cartões dados (a pilha solta na "Adicionar coluna").
  createColumnWithCards: (cardIds: readonly string[]) => void;
  notifyUndoable: (description: string) => Promise<void>;
  onSaveError: () => void;
}

// Modo "Selecionar" do quadro: os marcados, o "Selecionar todos"/"Limpar" de cada coluna, as ações
// da barra de baixo (Mover, Arquivar, Apagar) e o arraste em lote (a pilha).
export function useBoardSelection({
  boardId,
  data,
  columns,
  visible,
  onDataChange,
  moveCard,
  createColumnWithCards,
  notifyUndoable,
  onSaveError,
}: BoardSelectionOptions) {
  const selection = useCardSelection();
  const { selectMany, deselectMany, selectedIds: selectedSet, cancel: endSelection } = selection;

  // "Selecionar todos" da coluna marca só os cartões à mostra (com filtro, só os que passam).
  const selectColumnCards = useCallback(
    (columnId: string) => {
      const column = visible.columns.find((item) => item.id === columnId);
      if (column) selectMany(column.visibleCards.map((card) => card.id));
    },
    [visible.columns, selectMany],
  );
  // "Limpar" desmarca todos os cartões da coluna, inclusive os escondidos pelo filtro.
  const clearColumnSelection = useCallback(
    (columnId: string) => {
      const column = visible.columns.find((item) => item.id === columnId);
      if (column) deselectMany(column.cards.map((card) => card.id));
    },
    [visible.columns, deselectMany],
  );

  // Selecionados na ordem do quadro: é nela que chegam ao destino ao mover.
  const orderedSelectedIds = useMemo(
    () =>
      selectedSet
        ? columns.flatMap((column) =>
            column.cards.filter((card) => selectedSet.has(card.id)).map((card) => card.id),
          )
        : [],
    [columns, selectedSet],
  );
  // Marcados na ordem em que foram marcados (o Set guarda a ordem de entrada).
  const selectionOrder = useMemo(() => (selectedSet ? [...selectedSet] : []), [selectedSet]);
  // Colunas com algum cartão marcado (o "Selecionar todos" vira "Limpar" só nelas).
  const selectedColumnIds = useMemo(
    () =>
      selectedSet
        ? new Set(
            columns
              .filter((column) => column.cards.some((card) => selectedSet.has(card.id)))
              .map((column) => column.id),
          )
        : null,
    [columns, selectedSet],
  );
  const titleOf = useCallback(
    (cardId: string) =>
      columns.flatMap((column) => column.cards).find((card) => card.id === cardId)?.title,
    [columns],
  );

  const batch = useCardBatchActions({
    boardId,
    selectedIds: orderedSelectedIds,
    titleOf,
    onDone: endSelection,
    notifyUndoable,
    onSaveError,
  });
  // Soltar a pilha do arraste em lote numa vaga.
  const batchMove = useBatchMove({
    data,
    moveCard,
    createColumnWithCards,
    selectionOrder,
    onDataChange,
    selectedIds: orderedSelectedIds,
    toFullIndex: visible.toFullIndexMany,
    onDone: endSelection,
    notifyUndoable,
    onSaveError,
  });

  return {
    selection,
    batch,
    // Marcados na ordem do quadro (a pilha do arraste em lote segue essa ordem).
    selectedInOrder: orderedSelectedIds,
    selectedColumnIds,
    selectColumnCards,
    clearColumnSelection,
    // O soltar do arraste: com a pilha, leva todos os marcados.
    moveCard: batchMove.dropCard,
    startBatchDrag: batchMove.startBatchDrag,
    endBatchDrag: batchMove.endBatchDrag,
    // Solto na coluna "Adicionar coluna" (com a pilha, leva todos os marcados).
    dropOnNewColumn: batchMove.dropOnNewColumn,
    isBatchDragging: batchMove.isBatchDragging,
  };
}
