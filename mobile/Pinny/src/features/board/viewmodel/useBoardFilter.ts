import { useCallback, useMemo, useState } from 'react';

import type { Priority } from '@/features/card/model/card.types';
import { PRIORITIES } from '@/db/schema';
import { ptBR } from '@/i18n/pt-BR';

import type { Label } from '../model/board.schema';
import type { BoardData } from '../model/boardData';
import {
  type CardFilter,
  countMatchingCards,
  DEADLINE_FILTERS,
  type DeadlineFilter,
  EMPTY_CARD_FILTER,
  toggleIn,
} from '../model/cardFilter';
import { labelRepository } from '../model/labelRepository';

const text = ptBR.board.filter;

// Modal "Filtrar" do quadro: as escolhas ficam num rascunho até "Mostrar N cartões"; fechar
// descarta o rascunho. O botão mostra, ao vivo, quantos cartões passam.
export function useBoardFilter(boardId: string, data: BoardData | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [applied, setApplied] = useState<CardFilter>(EMPTY_CARD_FILTER);
  const [draft, setDraft] = useState<CardFilter>(EMPTY_CARD_FILTER);
  const [labels, setLabels] = useState<Label[]>([]);

  const open = useCallback(() => {
    setDraft(applied);
    setIsOpen(true);
    labelRepository
      .listByBoard(boardId)
      .then(setLabels)
      .catch((error: unknown) => {
        console.warn('Falha ao carregar as etiquetas.', error);
      });
  }, [applied, boardId]);

  const close = useCallback(() => setIsOpen(false), []);

  const apply = useCallback(() => {
    setApplied(draft);
    setIsOpen(false);
  }, [draft]);

  const matchCount = useMemo(
    () => (data ? countMatchingCards(data, draft, new Date()) : 0),
    [data, draft],
  );

  const update = (patch: Partial<CardFilter>) => setDraft((current) => ({ ...current, ...patch }));

  return {
    isOpen,
    open,
    close,
    apply,
    applyText: text.apply(matchCount),
    clear: () => setDraft(EMPTY_CARD_FILTER),
    deadlineOptions: DEADLINE_FILTERS.map((value) => ({
      value,
      label: text.deadlineOptions[value],
      isSelected: draft.deadline === value,
    })),
    selectDeadline: (deadline: DeadlineFilter) => update({ deadline }),
    priorityOptions: [...PRIORITIES].reverse().map((priority) => ({
      priority,
      accessibilityLabel: ptBR.card.priorityA11y[priority],
      isSelected: draft.priorities.includes(priority),
    })),
    togglePriority: (priority: Priority) =>
      update({ priorities: toggleIn(draft.priorities, priority) }),
    labelOptions: labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      accessibilityLabel: text.labelA11y(label.name),
      isSelected: draft.labelIds.includes(label.id),
    })),
    toggleLabel: (labelId: string) => update({ labelIds: toggleIn(draft.labelIds, labelId) }),
    showCompleted: draft.showCompleted,
    setShowCompleted: (showCompleted: boolean) => update({ showCompleted }),
    onlyPendingChecklist: draft.onlyPendingChecklist,
    setOnlyPendingChecklist: (onlyPendingChecklist: boolean) => update({ onlyPendingChecklist }),
  };
}

export type BoardFilterViewModel = ReturnType<typeof useBoardFilter>;
