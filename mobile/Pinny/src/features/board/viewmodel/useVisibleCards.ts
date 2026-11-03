import { useMemo } from 'react';

import type { Card } from '@/features/card/model/card.schema';
import { ptBR } from '@/i18n/pt-BR';

import type { BoardData } from '../model/boardData';
import {
  type CardFilter,
  matchesCardFilter,
  toFullIndex,
  visibleCardIds,
} from '../model/cardFilter';
import type { BoardColumnItem } from './boardItems';

const text = ptBR.board;

// O que o quadro mostra com o filtro aplicado: todas as colunas, só com os cartões que passam
// (visibleCards). Os escondidos continuam montados, só invisíveis: ligar e limpar o filtro não
// cria nem destrói views. Coluna esvaziada pelo filtro avisa que os cartões estão escondidos
// (não apagados). Os objetos das colunas sem cartão escondido são reaproveitados.
export function useVisibleCards(
  data: BoardData | null,
  columns: BoardColumnItem[],
  filter: CardFilter,
) {
  const visibleIds = useMemo(
    () => (data ? visibleCardIds(data, filter, new Date()) : null),
    [data, filter],
  );

  const visibleColumns = useMemo(() => {
    if (!visibleIds) return columns;
    return columns.map((column) => {
      const visibleCards = column.cards.filter((card) => visibleIds.has(card.id));
      if (visibleCards.length === column.cards.length) return column;
      return {
        ...column,
        visibleCards,
        emptyMessage: visibleCards.length === 0 ? text.filter.emptyColumn : column.emptyMessage,
      };
    });
  }, [columns, visibleIds]);

  const total = columns.reduce((sum, column) => sum + column.cards.length, 0);
  const visible = visibleColumns.reduce((sum, column) => sum + column.visibleCards.length, 0);

  return {
    columns: visibleColumns,
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
    // Cartão recém-criado que o filtro esconderia (sem etiquetas nem checklist ainda).
    hidesNewCard: (card: Card) =>
      visibleIds !== null &&
      !matchesCardFilter({ card, labels: [], checklist: null }, filter, new Date()),
  };
}
