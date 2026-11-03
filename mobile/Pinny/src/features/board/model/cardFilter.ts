import { UPCOMING_DAYS } from '@/constants/limits';
import type { Priority } from '@/features/card/model/card.types';
import { getDeadlineStatus } from '@/features/card/model/deadline';

import type { BoardCard, BoardData } from './boardData';

// Filtro do quadro (modal "Filtrar"). Entre categorias vale "e"; dentro de uma categoria
// (prioridades, etiquetas), "ou". Funções puras: o ViewModel só guarda o estado.

export type DeadlineFilter = 'any' | 'overdue' | 'today' | 'upcoming' | 'none';

export const DEADLINE_FILTERS: readonly DeadlineFilter[] = [
  'any',
  'overdue',
  'today',
  'upcoming',
  'none',
];

export interface CardFilter {
  deadline: DeadlineFilter;
  priorities: readonly Priority[];
  labelIds: readonly string[];
  showCompleted: boolean;
  onlyPendingChecklist: boolean;
}

// Sem filtro: o quadro mostra tudo, inclusive os concluídos.
export const EMPTY_CARD_FILTER: CardFilter = {
  deadline: 'any',
  priorities: [],
  labelIds: [],
  showCompleted: true,
  onlyPendingChecklist: false,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function matchesDeadline(item: BoardCard, deadline: DeadlineFilter, now: Date): boolean {
  const { dueAt } = item.card;
  if (deadline === 'any') return true;
  if (deadline === 'none') return !dueAt;
  if (!dueAt) return false;
  if (deadline === 'overdue') return getDeadlineStatus(item.card, now) === 'overdue';
  const due = Date.parse(dueAt);
  const today = startOfDay(now);
  const days = deadline === 'today' ? 1 : UPCOMING_DAYS;
  return due >= today && due < today + days * MS_PER_DAY;
}

export function matchesCardFilter(item: BoardCard, filter: CardFilter, now: Date): boolean {
  const { card, labels, checklist } = item;
  if (!filter.showCompleted && card.completedAt) return false;
  if (filter.onlyPendingChecklist && !(checklist && checklist.done < checklist.total)) {
    return false;
  }
  if (
    filter.priorities.length > 0 &&
    (!card.priority || !filter.priorities.includes(card.priority))
  ) {
    return false;
  }
  if (filter.labelIds.length > 0 && !labels.some((label) => filter.labelIds.includes(label.id))) {
    return false;
  }
  return matchesDeadline(item, filter.deadline, now);
}

// Quantos cartões do quadro passam no filtro (o botão "Mostrar N cartões").
export function countMatchingCards(data: BoardData, filter: CardFilter, now: Date): number {
  return data.columns.reduce(
    (total, column) =>
      total + column.cards.filter((item) => matchesCardFilter(item, filter, now)).length,
    0,
  );
}

// Quantas categorias estão filtrando (para o selo de filtro ativo e o "Limpar tudo").
export function activeFilterCount(filter: CardFilter): number {
  return [
    filter.deadline !== EMPTY_CARD_FILTER.deadline,
    filter.priorities.length > 0,
    filter.labelIds.length > 0,
    filter.showCompleted !== EMPTY_CARD_FILTER.showCompleted,
    filter.onlyPendingChecklist,
  ].filter(Boolean).length;
}

// Liga ou desliga um valor numa lista (seleção múltipla), sem alterar a original.
export function toggleIn<T>(items: readonly T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}
