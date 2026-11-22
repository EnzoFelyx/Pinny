import type { CardDeadline, CardLabel } from '@/components/Card';
import { photoUri } from '@/features/card/model/photoFiles';
import type { Card } from '@/features/card/model/card.schema';
import type { Priority } from '@/features/card/model/card.types';
import type { ChecklistProgress } from '@/features/card/model/checklistRepository';
import { getDeadlineStatus } from '@/features/card/model/deadline';
import { ptBR } from '@/i18n/pt-BR';
import { formatDueDate } from '@/utils/date';
import type { TextPart } from '@/utils/text';

import type { BoardCard, BoardColumn, BoardData } from '../model/boardData';
import type { EmptyVariant, EmptyVariantMap } from '../model/emptyVariants';

const text = ptBR.card;
const STATUS_SEPARATOR = ' · ';

// Cartão pronto para exibir: textos já formatados, a View não calcula nada.
export interface BoardCardItem {
  id: string;
  title: string;
  // Só durante a busca, quando o termo aparece no título: os trechos para o marca-texto.
  titleParts?: TextPart[];
  accessibilityLabel: string;
  labels: CardLabel[];
  priority?: Priority;
  deadline?: CardDeadline;
  checklistText?: string;
  // Foto de capa do post-it (miniatura).
  thumbnail?: { uri: string };
}

export interface BoardColumnItem {
  id: string;
  title: string;
  // Todos os cartões da coluna (ficam montados) e os que o filtro deixa à mostra. Sem filtro, é o
  // mesmo array: o filtro só troca visibleCards, e esconder um cartão não o desmonta.
  cards: BoardCardItem[];
  visibleCards: BoardCardItem[];
  // Estado vazio sorteado para esta coluna (frase + ilustração), sem repetir entre as vazias.
  emptyMessage: string;
  emptyVariant: EmptyVariant;
}

// "Hoje, 10h · Em breve", "17 mai · Atrasado" ou só "20 mai" (prazo normal).
export function toDeadline(card: Card, now: Date): CardDeadline | undefined {
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
export function toAccessibilityLabel(
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
  const { card, labels, checklist, coverPath } = item;
  const deadline = toDeadline(card, now);
  return {
    id: card.id,
    title: card.title,
    accessibilityLabel: toAccessibilityLabel(item, deadline, checklist),
    labels: labels.map((label) => ({ id: label.id, name: label.name, color: label.color })),
    priority: card.priority ?? undefined,
    deadline,
    checklistText: checklist ? text.checklist(checklist.done, checklist.total) : undefined,
    thumbnail: coverPath ? { uri: photoUri(coverPath) } : undefined,
  };
}

export function toColumnItem(
  { column, cards }: BoardColumn,
  now: Date,
  emptyVariant: EmptyVariant = 0,
): BoardColumnItem {
  const items = cards.map((card) => toCardItem(card, now));
  return {
    id: column.id,
    title: column.title,
    cards: items,
    visibleCards: items,
    emptyMessage: ptBR.board.emptyColumnMessages[emptyVariant],
    emptyVariant,
  };
}

function isSameCardItem(a: BoardCardItem, b: BoardCardItem): boolean {
  return (
    a.title === b.title &&
    a.accessibilityLabel === b.accessibilityLabel &&
    a.priority === b.priority &&
    a.checklistText === b.checklistText &&
    a.thumbnail?.uri === b.thumbnail?.uri &&
    a.deadline?.text === b.deadline?.text &&
    a.deadline?.status === b.deadline?.status &&
    a.labels.length === b.labels.length &&
    a.labels.every((label, index) => {
      const other = b.labels[index];
      return (
        other !== undefined &&
        label.id === other.id &&
        label.name === other.name &&
        label.color === other.color
      );
    })
  );
}

function isSameColumnItem(a: BoardColumnItem, b: BoardColumnItem): boolean {
  return (
    a.title === b.title &&
    a.emptyMessage === b.emptyMessage &&
    a.emptyVariant === b.emptyVariant &&
    a.cards.length === b.cards.length &&
    a.cards.every((card, index) => card === b.cards[index])
  );
}

// Colunas prontas para exibir, reaproveitando os objetos da versão anterior que não mudaram:
// a cada recarga do banco, só as colunas e os cartões alterados são redesenhados (as colunas e
// os cartões da tela são memo).
export function toColumnItems(
  data: BoardData | null,
  emptyVariants: EmptyVariantMap,
  previous: readonly BoardColumnItem[],
  now: Date,
): BoardColumnItem[] {
  const previousColumns = new Map(previous.map((column) => [column.id, column]));
  const previousCards = new Map(
    previous.flatMap((column) => column.cards.map((card) => [card.id, card] as const)),
  );
  return (data?.columns ?? []).map((item) => {
    const next = toColumnItem(item, now, emptyVariants[item.column.id]);
    const cards = next.cards.map((card) => {
      const old = previousCards.get(card.id);
      return old && isSameCardItem(old, card) ? old : card;
    });
    const column = { ...next, cards, visibleCards: cards };
    const old = previousColumns.get(column.id);
    return old && isSameColumnItem(old, column) ? old : column;
  });
}

// Recalcula as colunas com um novo "agora" (o estado do prazo muda com o tempo). Sem nenhum
// cartão mudando, devolve as mesmas colunas (nada é redesenhado).
export function refreshColumnItems(
  data: BoardData | null,
  emptyVariants: EmptyVariantMap,
  previous: BoardColumnItem[],
  now: Date,
): BoardColumnItem[] {
  const next = toColumnItems(data, emptyVariants, previous, now);
  const isSame =
    next.length === previous.length && next.every((column, index) => column === previous[index]);
  return isSame ? previous : next;
}

// Cartões pelos ids, na ordem dada (os que não estão mais no quadro ficam de fora). Usado pela
// camada de arraste: o cartão segurado e os da pilha.
export function findCardItems(
  columns: readonly BoardColumnItem[],
  ids: readonly string[],
): BoardCardItem[] {
  const byId = new Map(columns.flatMap((column) => column.cards.map((card) => [card.id, card])));
  return ids.flatMap((id) => {
    const card = byId.get(id);
    return card ? [card] : [];
  });
}
