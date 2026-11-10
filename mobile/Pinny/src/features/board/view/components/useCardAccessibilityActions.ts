import { useCallback, useMemo } from 'react';
import { AccessibilityInfo, type AccessibilityActionEvent } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

import type { CardActions } from './boardActions';

const text = ptBR.board;

type MoveAction = 'moveUp' | 'moveDown' | 'moveToPreviousColumn' | 'moveToNextColumn' | 'moveTo';

const actionLabels: Record<MoveAction, string> = {
  moveUp: text.moveUp,
  moveDown: text.moveDown,
  moveToPreviousColumn: text.moveToPreviousColumn,
  moveToNextColumn: text.moveToNextColumn,
  moveTo: text.moveTo,
};

interface CardAccessibilityOptions {
  cardId: string;
  columnId: string;
  columnIndex: number;
  columnCount: number;
  // Posição do cartão na coluna e quantos cartões ela tem.
  index: number;
  total: number;
  actions: CardActions;
}

// Alternativas sem gesto ao arraste (CLAUDE.md, regra 15): mover uma vaga, mudar de coluna ou
// escolher coluna e posição na folha "Mover para...". O leitor de tela anuncia o resultado.
// As ações de coluna só aparecem quando existe coluna daquele lado.
export function useCardAccessibilityActions({
  cardId,
  columnId,
  columnIndex,
  columnCount,
  index,
  total,
  actions,
}: CardAccessibilityOptions) {
  const accessibilityActions = useMemo(() => {
    const names: MoveAction[] = ['moveUp', 'moveDown'];
    if (columnIndex > 0) names.push('moveToPreviousColumn');
    if (columnIndex < columnCount - 1) names.push('moveToNextColumn');
    names.push('moveTo');
    return names.map((name) => ({ name, label: actionLabels[name] }));
  }, [columnIndex, columnCount]);

  const { move, moveToAdjacentColumn, openMoveCard } = actions;
  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const action = event.nativeEvent.actionName;
      if (action === 'moveTo') {
        openMoveCard(cardId);
        return;
      }
      if (action === 'moveToPreviousColumn' || action === 'moveToNextColumn') {
        const announcement = moveToAdjacentColumn(cardId, action === 'moveToNextColumn' ? 1 : -1);
        if (announcement) AccessibilityInfo.announceForAccessibility(announcement);
        return;
      }
      const target = index + (action === 'moveUp' ? -1 : 1);
      if (target < 0 || target >= total) return;
      move(cardId, columnId, target);
      AccessibilityInfo.announceForAccessibility(text.movedTo(target + 1, total));
    },
    [cardId, columnId, index, total, move, moveToAdjacentColumn, openMoveCard],
  );

  return { accessibilityActions, onAccessibilityAction };
}
