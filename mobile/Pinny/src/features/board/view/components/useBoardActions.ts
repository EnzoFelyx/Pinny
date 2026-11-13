import { useMemo } from 'react';

import { useStableCallback } from '@/hooks/useStableCallback';

import type { CardActions, ColumnActions } from './boardActions';

type BoardActionsSource = Pick<CardActions, 'openMoveCard'> & {
  moveCard: CardActions['move'];
  moveCardToAdjacentColumn: CardActions['moveToAdjacentColumn'];
  toggleCardSelection: CardActions['toggleSelect'];
  addCard: ColumnActions['addCard'];
  moveColumn: ColumnActions['move'];
  moveColumnTo: ColumnActions['moveTo'];
  duplicateColumn: ColumnActions['duplicate'];
  renameColumn: ColumnActions['rename'];
  requestDeleteColumn: ColumnActions['requestDelete'];
  selectColumnCards: ColumnActions['selectAllCards'];
  clearColumnSelection: ColumnActions['clearSelection'];
  // Entram no objeto `drag` (useBoardDrag): se mudarem de identidade, `drag` muda e todas as
  // colunas e cartões redesenham. dropOnNewColumn, por exemplo, é recriado a cada seleção.
  dropOnNewColumn: (cardId: string) => void;
  startBatchDrag: (heldId: string) => void;
  endBatchDrag: () => void;
};

// Ações que a tela repassa às colunas e aos cartões, com identidade fixa: as do ViewModel mudam a
// cada recarga dos dados, e trocá-las redesenharia todas as colunas e cartões (que são memo).
export function useBoardActions(vm: BoardActionsSource) {
  const moveCard = useStableCallback(vm.moveCard);
  const moveCardToAdjacentColumn = useStableCallback(vm.moveCardToAdjacentColumn);
  const openMoveCard = useStableCallback(vm.openMoveCard);
  const toggleSelect = useStableCallback(vm.toggleCardSelection);
  const addCard = useStableCallback(vm.addCard);
  const moveColumn = useStableCallback(vm.moveColumn);
  const moveColumnTo = useStableCallback(vm.moveColumnTo);
  const duplicateColumn = useStableCallback(vm.duplicateColumn);
  const renameColumn = useStableCallback(vm.renameColumn);
  const requestDeleteColumn = useStableCallback(vm.requestDeleteColumn);
  const selectAllCards = useStableCallback(vm.selectColumnCards);
  const clearSelection = useStableCallback(vm.clearColumnSelection);
  const dropOnNewColumn = useStableCallback(vm.dropOnNewColumn);
  const startBatchDrag = useStableCallback(vm.startBatchDrag);
  const endBatchDrag = useStableCallback(vm.endBatchDrag);

  const cardActions = useMemo<CardActions>(
    () => ({
      move: moveCard,
      moveToAdjacentColumn: moveCardToAdjacentColumn,
      openMoveCard,
      toggleSelect,
    }),
    [moveCard, moveCardToAdjacentColumn, openMoveCard, toggleSelect],
  );
  const columnActions = useMemo<ColumnActions>(
    () => ({
      addCard,
      move: moveColumn,
      moveTo: moveColumnTo,
      duplicate: duplicateColumn,
      rename: renameColumn,
      requestDelete: requestDeleteColumn,
      selectAllCards,
      clearSelection,
    }),
    [
      addCard,
      moveColumn,
      moveColumnTo,
      duplicateColumn,
      renameColumn,
      requestDeleteColumn,
      selectAllCards,
      clearSelection,
    ],
  );
  return { cardActions, columnActions, dropOnNewColumn, startBatchDrag, endBatchDrag };
}
