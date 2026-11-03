import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import type { Priority } from '@/features/card/model/card.types';
import { PRIORITIES } from '@/db/schema';
import { ptBR } from '@/i18n/pt-BR';

import type { Label } from '../model/board.schema';
import type { BoardData } from '../model/boardData';
import {
  type ActiveFilterPart,
  activeFilterParts,
  type CardFilter,
  countMatchingCards,
  DEADLINE_FILTERS,
  type DeadlineFilter,
  EMPTY_CARD_FILTER,
  QUICK_FILTERS,
  toggleIn,
  withoutFilterPart,
  withQuickFilterToggled,
} from '../model/cardFilter';
import { labelRepository } from '../model/labelRepository';

const text = ptBR.board.filter;

// Modal "Filtrar" do quadro: as escolhas ficam num rascunho até "Mostrar N cartões"; fechar
// descarta o rascunho. O botão mostra, ao vivo, quantos cartões passam.
export function useBoardFilter(boardId: string, data: BoardData | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [applied, setAppliedNow] = useState<CardFilter>(EMPTY_CARD_FILTER);
  // O quadro filtrado é montado em segundo plano (transição): a tela não trava e, se demorar,
  // mostra o skeleton por cima das colunas (isApplying).
  const [isApplying, startApplying] = useTransition();
  const setApplied = useCallback((next: CardFilter | ((current: CardFilter) => CardFilter)) => {
    startApplying(() => setAppliedNow(next));
  }, []);
  const [draft, setDraft] = useState<CardFilter>(EMPTY_CARD_FILTER);
  const [labels, setLabels] = useState<Label[]>([]);

  // Etiquetas do quadro: nomes dos chips de filtro ativo e opções do modal (recarregadas ao abrir).
  const loadLabels = useCallback(() => {
    labelRepository
      .listByBoard(boardId)
      .then(setLabels)
      .catch((error: unknown) => {
        console.warn('Falha ao carregar as etiquetas.', error);
      });
  }, [boardId]);
  useEffect(loadLabels, [loadLabels]);

  const open = useCallback(() => {
    setDraft(applied);
    setIsOpen(true);
    loadLabels();
  }, [applied, loadLabels]);

  const close = useCallback(() => setIsOpen(false), []);

  const apply = useCallback(() => {
    setIsOpen(false);
    setApplied(draft);
  }, [draft, setApplied]);

  const matchCount = useMemo(
    () => (data ? countMatchingCards(data, draft, new Date()) : 0),
    [data, draft],
  );

  // Texto do chip de cada parte ligada do filtro (etiqueta apagada não vira chip).
  const partLabel = (part: ActiveFilterPart): string | null => {
    switch (part.kind) {
      case 'deadline':
        return text.deadlineOptions[part.deadline];
      case 'priority':
        return ptBR.card.priority[part.priority];
      case 'label':
        return labels.find((label) => label.id === part.labelId)?.name ?? null;
      case 'hideCompleted':
        return text.hideCompleted;
      case 'pendingChecklist':
        return text.pendingChecklist;
    }
  };
  const activeChips = activeFilterParts(applied).flatMap((part) => {
    const label = partLabel(part);
    if (label === null) return [];
    return [
      {
        key: part.kind === 'label' ? part.labelId : `${part.kind}-${label}`,
        label,
        removeAccessibilityLabel: text.removeA11y(label),
        remove: () => setApplied((current) => withoutFilterPart(current, part)),
      },
    ];
  });

  const update = (patch: Partial<CardFilter>) => setDraft((current) => ({ ...current, ...patch }));

  return {
    // Filtro em uso no quadro (o rascunho do modal só vale ao aplicar).
    applied,
    isApplying,
    // Linha de filtros do quadro: atalhos sem filtro; com filtro, um chip removível por parte.
    hasActiveFilter: activeChips.length > 0,
    activeChips,
    clearApplied: () => setApplied(EMPTY_CARD_FILTER),
    quickFilters: QUICK_FILTERS.map((quick) => ({
      id: quick,
      label: text.quick[quick],
      accessibilityLabel: text.quickA11y(text.quick[quick]),
      toggle: () => setApplied((current) => withQuickFilterToggled(current, quick)),
    })),
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
