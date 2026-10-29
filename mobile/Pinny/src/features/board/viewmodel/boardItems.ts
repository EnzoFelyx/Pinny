import type { CardDeadline, CardLabel } from '@/components/Card';
import type { Card } from '@/features/card/model/card.schema';
import type { Priority } from '@/features/card/model/card.types';
import type { ChecklistProgress } from '@/features/card/model/checklistRepository';
import { getDeadlineStatus } from '@/features/card/model/deadline';
import { ptBR } from '@/i18n/pt-BR';
import { formatDueDate } from '@/utils/date';

import type { BoardCard, BoardColumn } from '../model/boardData';

const text = ptBR.card;
const STATUS_SEPARATOR = ' · ';

// Cartão pronto para exibir: textos já formatados, a View não calcula nada.
export interface BoardCardItem {
  id: string;
  title: string;
  accessibilityLabel: string;
  labels: CardLabel[];
  priority?: Priority;
  deadline?: CardDeadline;
  checklistText?: string;
}

export interface BoardColumnItem {
  id: string;
  title: string;
  cards: BoardCardItem[];
}

// "Hoje, 10h · Em breve", "17 mai · Atrasado" ou só "20 mai" (prazo normal).
function toDeadline(card: Card, now: Date): CardDeadline | undefined {
  const status = getDeadlineStatus(card, now);
  if (!status) return undefined;

  const date = card.dueAt ? formatDueDate(new Date(card.dueAt), now, text.today) : '';
  const statusText = text.deadlineStatus[status];
  return {
    status,
    text: [date, statusText].filter(Boolean).join(STATUS_SEPARATOR),
  };
}

// Ex.: "Cartão Estudar para a prova, Etiqueta Estudos, Prioridade alta, prazo Hoje, 14h · Em breve,
// 2 de 5 subtarefas concluídas".
function toAccessibilityLabel(
  item: BoardCard,
  deadline: CardDeadline | undefined,
  checklist: ChecklistProgress | null,
): string {
  const { card, labels } = item;
  return [
    text.summaryTitle(card.title),
    ...labels.map((label) => text.labelA11y(label.name)),
    card.priority ? text.priorityA11y[card.priority] : null,
    deadline ? text.summaryDeadline(deadline.text) : null,
    checklist ? text.summaryChecklist(checklist.done, checklist.total) : null,
  ]
    .filter(Boolean)
    .join(', ');
}

export function toCardItem(item: BoardCard, now: Date): BoardCardItem {
  const { card, labels, checklist } = item;
  const deadline = toDeadline(card, now);
  return {
    id: card.id,
    title: card.title,
    accessibilityLabel: toAccessibilityLabel(item, deadline, checklist),
    labels: labels.map((label) => ({ id: label.id, name: label.name, color: label.color })),
    priority: card.priority ?? undefined,
    deadline,
    checklistText: checklist ? text.checklist(checklist.done, checklist.total) : undefined,
  };
}

export function toColumnItem({ column, cards }: BoardColumn, now: Date): BoardColumnItem {
  return {
    id: column.id,
    title: column.title,
    cards: cards.map((card) => toCardItem(card, now)),
  };
}
