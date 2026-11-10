import { useMemo, useState } from 'react';

import { ptBR } from '@/i18n/pt-BR';
import { normalizeForSearch } from '@/utils/text';

import { filterFoldersByQuery } from '../model/homeData';
import { toFolderItem, useFolderItems } from './useFolderItems';

const text = ptBR.search;

// Aba de busca: o campo é a barra de busca nativa do iOS (ver app/(tabs)/search/index.tsx).
export function useSearchViewModel() {
  const { items, loadErrorText, openBoard } = useFolderItems();
  const [query, setQuery] = useState('');

  const hasQuery = normalizeForSearch(query).length > 0;
  const folders = useMemo(
    () => (hasQuery ? filterFoldersByQuery(items, query).map((item) => toFolderItem(item)) : []),
    [items, query, hasQuery],
  );

  return {
    folders,
    errorText: loadErrorText,
    hintText: hasQuery ? null : text.hint,
    noResultsText: hasQuery && folders.length === 0 ? ptBR.folders.noResults(query) : null,
    changeQuery: setQuery,
    openBoard,
  };
}
