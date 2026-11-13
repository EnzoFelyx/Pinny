import { splitByMatch } from '@/utils/text';

import { type ArchivedCardsData, type ArchivedOrder, groupArchived } from '../model/archivedCards';
import { type CardFilter, matchesCardFilter, matchesSearch } from '../model/cardFilter';
import { type BoardCardItem, toCardItem } from './boardItems';

// Um bloco da tela "Arquivados": uma coluna só (mais recentes/antigos) ou uma por coluna de origem.
export interface ArchivedGroupItem {
  key: string;
  title: string;
  // Só os que passam na busca e no filtro, já com o marca-texto da busca no título.
  cards: BoardCardItem[];
  // Todos os do bloco, inclusive os escondidos ("Limpar" desmarca todos).
  allIds: string[];
  emptyMessage: string;
}

const SINGLE_GROUP_KEY = 'all';

function withTitleHighlight(card: BoardCardItem, term: string): BoardCardItem {
  const titleParts = splitByMatch(card.title, term);
  return titleParts ? { ...card, titleParts } : card;
}

interface ArchivedGroupsInput {
  data: ArchivedCardsData;
  order: ArchivedOrder;
  filter: CardFilter;
  // Termo da busca já normalizado ('' = sem busca).
  term: string;
  // Título do bloco único e frase do bloco vazio.
  singleTitle: string;
  emptyMessage: string;
  now: Date;
}

// Blocos prontos para a tela: ordem escolhida, busca e filtro juntos. Sem nenhum arquivado, o
// "Por coluna" mostra o bloco único vazio (a tela nunca fica sem coluna).
export function toArchivedGroups({
  data,
  order,
  filter,
  term,
  singleTitle,
  emptyMessage,
  now,
}: ArchivedGroupsInput): ArchivedGroupItem[] {
  const groups = groupArchived(data.cards, data.columns, order);
  const blocks = groups.length > 0 ? groups : [{ column: null, cards: [] }];
  return blocks.map(({ column, cards }) => ({
    key: column?.id ?? SINGLE_GROUP_KEY,
    title: column?.title ?? singleTitle,
    cards: cards
      .filter((item) => matchesSearch(item, term) && matchesCardFilter(item, filter, now))
      .map((item) => withTitleHighlight(toCardItem(item, now), term)),
    allIds: cards.map((item) => item.card.id),
    emptyMessage,
  }));
}
