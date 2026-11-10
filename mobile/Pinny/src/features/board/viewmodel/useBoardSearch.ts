import { useCallback, useDeferredValue, useState } from 'react';

import { normalizeForSearch } from '@/utils/text';

// "Buscar lembrete" do quadro: o campo de vidro toma o lugar do título e, a cada letra, os cartões
// que não têm o termo no título nem na descrição somem. Vale só enquanto a busca está aberta.
export function useBoardSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  // O campo responde na hora; o quadro filtra logo depois, sem travar a digitação.
  const term = normalizeForSearch(useDeferredValue(query));

  const start = useCallback(() => setIsSearching(true), []);
  // O "X" fecha a busca e o quadro volta a mostrar todos os cartões (respeitando os filtros).
  const cancel = useCallback(() => {
    setIsSearching(false);
    setQuery('');
  }, []);

  return {
    isSearching,
    query,
    setQuery,
    term: isSearching ? term : '',
    start,
    cancel,
  };
}

export type BoardSearchViewModel = ReturnType<typeof useBoardSearch>;
