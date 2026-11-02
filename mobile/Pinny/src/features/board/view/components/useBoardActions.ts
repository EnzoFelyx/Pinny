import { useMemo } from 'react';

import { useStableCallback } from '@/hooks/useStableCallback';

import type { CardActions, ColumnActions } from './boardActions';

type BoardActionsSource = Pick<CardActions, 'openMoveCard'> & {
  moveCard: CardActions['move'];
  moveCardToAdjacentColumn: CardActions['moveToAdjacentColumn'];
  addCard: ColumnActions['addCard'];
  moveColumn: ColumnActions['move'];
  duplicateColumn: ColumnActions['duplicate'];
  renameColumn: ColumnActions['rename'];
  requestDeleteColumn: ColumnActions['requestDelete'];
};

// Ações que a tela repassa às colunas e aos cartões, com identidade fixa: as do ViewModel mudam a
// cada recarga dos dados, e trocá-las redesenharia todas as colunas e cartões (que são memo).
export function useBoardActions(vm: BoardActionsSource) {
  const moveCard = useStableCallback(vm.moveCard);
  const moveCardToAdjacentColumn = useStableCallback(vm.moveCardToAdjacentColumn);
  const openMoveCard = useStableCallback(vm.openMoveCard);
  const addCard = useStableCallback(vm.addCard);
  const moveColumn = useStableCallback(vm.moveColumn);
  const duplicateColumn = useStableCallback(vm.duplicateColumn);
  const renameColumn = useStableCallback(vm.renameColumn);
  const requestDeleteColumn = useStableCallback(vm.requestDeleteColumn);

  const cardActions = useMemo<CardActions>(
    () => ({ move: moveCard, moveToAdjacentColumn: moveCardToAdjacentColumn, openMoveCard }),
    [moveCard, moveCardToAdjacentColumn, openMoveCard],
  );
  const columnActions = useMemo<ColumnActions>(
    () => ({
      addCard,
      move: moveColumn,
      duplicate: duplicateColumn,
      rename: renameColumn,
      requestDelete: requestDeleteColumn,
    }),
    [addCard, moveColumn, duplicateColumn, renameColumn, requestDeleteColumn],
  );
  return { cardActions, columnActions };
}
