import { UPCOMING_DAYS } from '@/constants/limits';
import type { Priority } from '@/features/card/model/card.types';
import { getDeadlineStatus } from '@/features/card/model/deadline';
import { normalizeForSearch } from '@/utils/text';

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

// Quantos cartões passam no filtro (o botão "Mostrar N cartões").
export function countMatchingCards(
  cards: readonly BoardCard[],
  filter: CardFilter,
  now: Date,
): number {
  return cards.filter((item) => matchesCardFilter(item, filter, now)).length;
}

// Liga ou desliga um valor numa lista (seleção múltipla), sem alterar a original.
export function toggleIn<T>(items: readonly T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

// Atalhos da linha de filtros do quadro: um toque liga ou desliga, sem abrir o modal.
export type QuickFilter = 'today' | 'overdue' | 'high';

export const QUICK_FILTERS: readonly QuickFilter[] = ['today', 'overdue', 'high'];

export function withQuickFilterToggled(filter: CardFilter, quick: QuickFilter): CardFilter {
  if (quick === 'high') return { ...filter, priorities: toggleIn(filter.priorities, 'high') };
  return { ...filter, deadline: filter.deadline === quick ? 'any' : quick };
}

// Cada parte ligada do filtro vira um chip removível na linha do quadro.
export type ActiveFilterPart =
  | { kind: 'deadline'; deadline: DeadlineFilter }
  | { kind: 'priority'; priority: Priority }
  | { kind: 'label'; labelId: string }
  | { kind: 'hideCompleted' }
  | { kind: 'pendingChecklist' };

export function activeFilterParts(filter: CardFilter): ActiveFilterPart[] {
  return [
    ...(filter.deadline !== 'any'
      ? [{ kind: 'deadline', deadline: filter.deadline } as const]
      : []),
    ...filter.priorities.map((priority) => ({ kind: 'priority', priority }) as const),
    ...filter.labelIds.map((labelId) => ({ kind: 'label', labelId }) as const),
    ...(filter.showCompleted ? [] : [{ kind: 'hideCompleted' } as const]),
    ...(filter.onlyPendingChecklist ? [{ kind: 'pendingChecklist' } as const] : []),
  ];
}

export function withoutFilterPart(filter: CardFilter, part: ActiveFilterPart): CardFilter {
  switch (part.kind) {
    case 'deadline':
      return { ...filter, deadline: 'any' };
    case 'priority':
      return { ...filter, priorities: filter.priorities.filter((item) => item !== part.priority) };
    case 'label':
      return { ...filter, labelIds: filter.labelIds.filter((id) => id !== part.labelId) };
    case 'hideCompleted':
      return { ...filter, showCompleted: true };
    case 'pendingChecklist':
      return { ...filter, onlyPendingChecklist: false };
  }
}

export function isFilterActive(filter: CardFilter): boolean {
  return activeFilterParts(filter).length > 0;
}

// "Buscar lembrete": o termo (já normalizado, sem acentos) aparece no título ou na descrição.
export function matchesSearch(item: BoardCard, term: string): boolean {
  if (term.length === 0) return true;
  const { title, description } = item.card;
  return normalizeForSearch(title).includes(term) || normalizeForSearch(description).includes(term);
}

// Ids dos cartões que passam no filtro e na busca (as duas valem juntas). null = sem filtro nem
// busca (todos aparecem).
export function visibleCardIds(
  data: BoardData,
  filter: CardFilter,
  now: Date,
  searchTerm = '',
): ReadonlySet<string> | null {
  if (!isFilterActive(filter) && searchTerm.length === 0) return null;
  return new Set(
    data.columns.flatMap((column) =>
      column.cards
        .filter((item) => matchesCardFilter(item, filter, now) && matchesSearch(item, searchTerm))
        .map((item) => item.card.id),
    ),
  );
}
