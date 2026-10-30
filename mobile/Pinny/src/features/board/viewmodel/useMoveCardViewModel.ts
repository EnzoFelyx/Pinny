import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { Card } from '@/features/card/model/card.schema';
import { cardRepository } from '@/features/card/model/cardRepository';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import type { Column } from '../model/board.schema';
import { moveCardWithHistory } from '../model/cardMove';
import { columnRepository } from '../model/columnRepository';
import { edgePlacement } from '../model/reorder';

const text = ptBR.board.moveSheet;

export type MovePosition = 'start' | 'end';

export interface MoveOption<T extends string> {
  value: T;
  label: string;
  isSelected: boolean;
}

const POSITIONS: readonly MovePosition[] = ['start', 'end'];
const positionLabels: Record<MovePosition, string> = {
  start: text.positionStart,
  end: text.positionEnd,
};

// Folha "Mover para...": alternativa sem gesto ao arraste (CLAUDE.md, regra 15). Escolhe a
// coluna do quadro e se o cartão vai para o início ou o fim dela.
export function useMoveCardViewModel(cardId: string) {
  const [card, setCard] = useState<Card | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnId, setColumnId] = useState<string | null>(null);
  const [position, setPosition] = useState<MovePosition>('start');
  const [errorText, setErrorText] = useState<string | null>(null);
  const notifyUndoable = useUndoNotice();

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      const found = await cardRepository.getById(cardId);
      const current = found ? await columnRepository.getById(found.columnId) : null;
      if (!found || !current) return;
      const boardColumns = await columnRepository.listByBoard(current.boardId);
      if (!isActive) return;
      setCard(found);
      setColumns(boardColumns);
      setColumnId(found.columnId);
    };
    load().catch((error: unknown) => {
      console.warn('Falha ao carregar as colunas.', error);
      if (isActive) setErrorText(text.loadError);
    });
    return () => {
      isActive = false;
    };
  }, [cardId]);

  const move = useCallback(async () => {
    if (!card || !columnId) return;
    try {
      const siblings = await cardRepository.listByColumn(columnId);
      await moveCardWithHistory(
        card.id,
        columnId,
        edgePlacement(
          siblings.map((item) => item.id),
          card.id,
          position,
        ),
        { columnId: card.columnId, position: card.position },
        ptBR.history.actions.moveCard,
      );
      router.back();
      await notifyUndoable(ptBR.board.cardMoved);
    } catch (error: unknown) {
      console.warn('Falha ao mover o cartão.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [card, columnId, position, notifyUndoable]);

  return {
    columnOptions: columns.map((column): MoveOption<string> => ({
      value: column.id,
      label: column.id === card?.columnId ? text.currentColumn(column.title) : column.title,
      isSelected: column.id === columnId,
    })),
    positionOptions: POSITIONS.map((value): MoveOption<MovePosition> => ({
      value,
      label: positionLabels[value],
      isSelected: value === position,
    })),
    errorText,
    canMove: card !== null && columnId !== null,
    selectColumn: setColumnId,
    selectPosition: setPosition,
    move,
  };
}
