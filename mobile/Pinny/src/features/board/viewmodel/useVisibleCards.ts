import { useMemo } from 'react';

import type { Card } from '@/features/card/model/card.schema';
import { ptBR } from '@/i18n/pt-BR';
import { splitByMatch } from '@/utils/text';

import type { BoardData } from '../model/boardData';
import {
  type CardFilter,
  matchesCardFilter,
  matchesSearch,
  visibleCardIds,
} from '../model/cardFilter';
import { toFullIndex, toFullIndexExcluding } from '../model/reorder';
import type { BoardCardItem, BoardColumnItem } from './boardItems';

const text = ptBR.board;

// Busca: os cartões à mostra com o termo no título ganham os trechos do marca-texto (um objeto
// novo só para eles; os outros continuam os mesmos e não são redesenhados). null = nenhum mudou.
function withTitleHighlights(
  cards: BoardCardItem[],
  visibleIds: ReadonlySet<string>,
  term: string,
): BoardCardItem[] | null {
  let changed = false;
  const next = cards.map((card) => {
    if (!visibleIds.has(card.id)) return card;
    const titleParts = splitByMatch(card.title, term);
    if (!titleParts) return card;
    changed = true;
    return { ...card, titleParts };
  });
  return changed ? next : null;
}

// O que o quadro mostra com o filtro aplicado: todas as colunas, só com os cartões que passam
// (visibleCards). Os escondidos continuam montados, só invisíveis: ligar e limpar o filtro não
// cria nem destrói views. Coluna esvaziada pelo filtro avisa que os cartões estão escondidos
// (não apagados). Os objetos das colunas sem cartão escondido são reaproveitados.
export function useVisibleCards(
  data: BoardData | null,
  columns: BoardColumnItem[],
  filter: CardFilter,
  searchTerm: string,
) {
  const visibleIds = useMemo(
    () => (data ? visibleCardIds(data, filter, new Date(), searchTerm) : null),
    [data, filter, searchTerm],
  );

  // Coluna esvaziada pela busca diz que nada foi encontrado; pelo filtro, que está escondida.
  const emptyByFilter = searchTerm ? text.search.emptyColumn : text.filter.emptyColumn;
  const visibleColumns = useMemo(() => {
    if (!visibleIds) return columns;
    return columns.map((column) => {
      const cards = searchTerm ? withTitleHighlights(column.cards, visibleIds, searchTerm) : null;
      const allCards = cards ?? column.cards;
      const visibleCards = allCards.filter((card) => visibleIds.has(card.id));
      if (!cards && visibleCards.length === column.cards.length) return column;
      return {
        ...column,
        cards: allCards,
        visibleCards,
        emptyMessage: visibleCards.length === 0 ? emptyByFilter : column.emptyMessage,
      };
    });
  }, [columns, visibleIds, emptyByFilter, searchTerm]);

  const total = columns.reduce((sum, column) => sum + column.cards.length, 0);
  const visible = visibleColumns.reduce((sum, column) => sum + column.visibleCards.length, 0);

  // Busca com um único resultado no quadro todo: o cartão e a coluna dele (o quadro rola até lá).
  const singleMatch = useMemo(() => {
    if (!searchTerm || visible !== 1) return null;
    const column = visibleColumns.find((item) => item.visibleCards.length === 1);
    const card = column?.visibleCards[0];
    return column && card ? { columnId: column.id, cardId: card.id } : null;
  }, [searchTerm, visible, visibleColumns]);

  return {
    columns: visibleColumns,
    visibleCount: visible,
    singleMatch,
    subtitle: data
      ? visibleIds
        ? text.subtitleFiltered(data.folderTitle, visible, total)
        : text.subtitle(data.folderTitle, total)
      : '',
    // Vaga do arraste (contada entre os visíveis) para o índice na coluna completa.
    toFullIndex: (cardId: string, toColumnId: string, toIndex: number) => {
      const target = data?.columns.find((item) => item.column.id === toColumnId);
      if (!visibleIds || !target) return toIndex;
      const ids = target.cards.map((item) => item.card.id);
      return toFullIndex(ids, cardId, visibleIds, toIndex);
    },
    // O mesmo para um lote (arraste da pilha): a vaga não conta nenhum dos cartões movidos.
    toFullIndexMany: (cardIds: readonly string[], toColumnId: string, toIndex: number) => {
      const target = data?.columns.find((item) => item.column.id === toColumnId);
      if (!target) return toIndex;
      const ids = target.cards.map((item) => item.card.id);
      return toFullIndexExcluding(ids, new Set(cardIds), visibleIds, toIndex);
    },
    // Cartão recém-criado que o filtro ou a busca esconderiam (sem etiquetas nem checklist ainda).
    hidesNewCard: (card: Card) => {
      const item = { card, labels: [], checklist: null };
      return (
        visibleIds !== null &&
        !(matchesCardFilter(item, filter, new Date()) && matchesSearch(item, searchTerm))
      );
    },
  };
}

export type VisibleCards = ReturnType<typeof useVisibleCards>;
