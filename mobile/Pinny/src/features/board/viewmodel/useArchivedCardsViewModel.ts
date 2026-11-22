import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { ptBR } from '@/i18n/pt-BR';

import {
  ARCHIVED_ORDERS,
  type ArchivedCardsData,
  type ArchivedOrder,
  loadArchivedCards,
} from '../model/archivedCards';
import { toArchivedGroups } from './archivedItems';
import { useArchivedActions } from './useArchivedActions';
import { useArchivedSections } from './useArchivedSections';
import { useBoardFilter } from './useBoardFilter';
import { useBoardSearch } from './useBoardSearch';
import { useCardSelection } from './useCardSelection';

const text = ptBR.board.archived;

// Tela "Arquivados" (… do quadro): os cartões arquivados em seções recolhíveis, uma por coluna de
// origem, com o "…" do topo (Buscar, Selecionar, Filtrar, Ordenar e Apagar todos) e o
// "Desarquivar" do toque longo. Busca, filtro, ordem e seções fechadas valem só enquanto a tela
// está aberta.
export function useArchivedCardsViewModel(boardId: string) {
  const [data, setData] = useState<ArchivedCardsData | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [order, setOrder] = useState<ArchivedOrder>('recent');
  const search = useBoardSearch();
  const filter = useBoardFilter(boardId, data?.cards ?? null);
  const selection = useCardSelection();

  // Carrega ao abrir e recarrega a cada mudança no banco (ex.: desfazer um arquivamento).
  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadArchivedCards(boardId)
        .then((result) => {
          if (!isActive) return;
          if (!result) {
            router.back();
            return;
          }
          setData(result);
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar os arquivados.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [boardId]);

  // Bloco vazio: diz se foi a busca, o filtro ou se não há arquivados mesmo.
  const emptyMessage = search.term
    ? ptBR.board.search.emptyColumn
    : filter.hasActiveFilter
      ? ptBR.board.filter.emptyColumn
      : text.empty;
  const groups = useMemo(
    () =>
      data
        ? toArchivedGroups({
            data,
            order,
            filter: filter.applied,
            term: search.term,
            emptyTitle: text.columnTitle,
            emptyMessage,
            now: new Date(),
          })
        : [],
    [data, order, filter.applied, search.term, emptyMessage],
  );
  const shownCount = groups.reduce((sum, group) => sum + group.cards.length, 0);
  const sections = useArchivedSections(groups, {
    term: search.term,
    filter: filter.applied,
    hasActiveFilter: filter.hasActiveFilter,
  });

  const allIds = useMemo(() => (data ? data.cards.map((item) => item.card.id) : []), [data]);
  const marked = selection.selectedIds;
  // Selecionados na ordem da tela (do arquivado mais recente para o mais antigo).
  const selectedIds = useMemo(
    () => (marked ? allIds.filter((id) => marked.has(id)) : []),
    [allIds, marked],
  );
  const titleOf = useCallback(
    (cardId: string) => data?.cards.find((item) => item.card.id === cardId)?.card.title,
    [data],
  );
  const reportSaveError = useCallback(() => setErrorText(ptBR.common.saveError), []);
  const actions = useArchivedActions({
    boardId,
    selectedIds,
    allIds,
    titleOf,
    onDone: selection.cancel,
    onSaveError: reportSaveError,
  });

  return {
    title: selection.isSelecting ? selection.title : text.title,
    subtitle: selection.isSelecting ? selection.hint : (data?.board.title ?? ''),
    isLoading: data === null && errorText === null,
    errorText,
    groups: groups.map((group) => ({
      ...group,
      headerA11y: text.sectionA11y(group.title, group.cards.length),
      isExpanded: sections.isExpanded(group.key),
      toggle: () => sections.toggle(group.key),
      hasSelected: marked ? group.allIds.some((id) => marked.has(id)) : false,
      selectAll: () => selection.selectMany(group.cards.map((card) => card.id)),
      clear: () => selection.deselectMany(group.allIds),
    })),
    hasArchived: allIds.length > 0,
    search,
    searchResultText: search.term ? ptBR.board.search.results(shownCount) : null,
    filter,
    sortOptions: ARCHIVED_ORDERS.map((value) => ({ value, label: text.menu.sortOptions[value] })),
    order,
    setOrder,
    selection,
    canAct: selectedIds.length > 0,
    ...actions,
    goBack: router.back,
  };
}

export type ArchivedCardsViewModel = ReturnType<typeof useArchivedCardsViewModel>;
