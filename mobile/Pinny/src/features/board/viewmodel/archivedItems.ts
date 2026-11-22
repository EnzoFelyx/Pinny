import { ptBR } from '@/i18n/pt-BR';
import { formatClockTime, formatShortDateWithYear, relativeDayOf } from '@/utils/date';
import { splitByMatch } from '@/utils/text';

import { type ArchivedCardsData, type ArchivedOrder, groupArchived } from '../model/archivedCards';
import type { BoardCard } from '../model/boardData';
import { type CardFilter, matchesCardFilter, matchesSearch } from '../model/cardFilter';
import { type BoardCardItem, toAccessibilityLabel, toCardItem } from './boardItems';

const text = ptBR.board.archived;

// Cartão da tela "Arquivados": sem o prazo (fica na folha do cartão) e com a linha "Arquivado …".
// A coluna de origem não aparece: a seção já diz de onde ele saiu.
export interface ArchivedCardItem extends BoardCardItem {
  archivedText?: string;
}

// Uma seção da tela "Arquivados": uma por coluna de origem. Sem nenhum arquivado, um bloco único
// (não recolhível) com o estado vazio.
export interface ArchivedGroupItem {
  key: string;
  title: string;
  // Só os que passam na busca e no filtro, já com o marca-texto da busca no título.
  cards: ArchivedCardItem[];
  // Todos os da seção, inclusive os escondidos ("Limpar" desmarca todos).
  allIds: string[];
  emptyMessage: string;
  isCollapsible: boolean;
}

const EMPTY_GROUP_KEY = 'all';

// "Arquivado hoje, 10:20", "Arquivado ontem, 19:10" ou "Arquivado em 16 nov" (com o ano se for
// outro).
export function formatArchivedAt(archivedAt: Date, now: Date): string {
  const relative = relativeDayOf(archivedAt, now);
  if (relative === 'today') return text.archivedAt.today(formatClockTime(archivedAt));
  if (relative === 'yesterday') return text.archivedAt.yesterday(formatClockTime(archivedAt));
  return text.archivedAt.on(formatShortDateWithYear(archivedAt, now));
}

export function toArchivedCardItem(item: BoardCard, now: Date, term: string): ArchivedCardItem {
  const archivedText = item.card.archivedAt
    ? formatArchivedAt(new Date(item.card.archivedAt), now)
    : undefined;
  const titleParts = splitByMatch(item.card.title, term) ?? undefined;
  return {
    ...toCardItem(item, now),
    deadline: undefined,
    titleParts,
    archivedText,
    accessibilityLabel: [toAccessibilityLabel(item, undefined, item.checklist), archivedText]
      .filter(Boolean)
      .join(', '),
  };
}

interface ArchivedGroupsInput {
  data: ArchivedCardsData;
  order: ArchivedOrder;
  filter: CardFilter;
  // Termo da busca já normalizado ('' = sem busca).
  term: string;
  // Título do bloco vazio (sem nenhum arquivado) e frase das seções vazias.
  emptyTitle: string;
  emptyMessage: string;
  now: Date;
}

// Seções prontas para a tela: uma por coluna de origem, na ordem do quadro, com a ordem escolhida
// dentro de cada uma e a busca e o filtro juntos. Sem nenhum arquivado, o bloco único vazio (a tela
// nunca fica sem coluna).
export function toArchivedGroups({
  data,
  order,
  filter,
  term,
  emptyTitle,
  emptyMessage,
  now,
}: ArchivedGroupsInput): ArchivedGroupItem[] {
  const groups = groupArchived(data.cards, data.columns, order);
  if (groups.length === 0) {
    return [
      {
        key: EMPTY_GROUP_KEY,
        title: emptyTitle,
        cards: [],
        allIds: [],
        emptyMessage,
        isCollapsible: false,
      },
    ];
  }
  return groups.map(({ column, cards }) => ({
    key: column.id,
    title: column.title,
    cards: cards
      .filter((item) => matchesSearch(item, term) && matchesCardFilter(item, filter, now))
      .map((item) => toArchivedCardItem(item, now, term)),
    allIds: cards.map((item) => item.card.id),
    emptyMessage,
    isCollapsible: true,
  }));
}
