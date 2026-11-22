import { useCallback, useState } from 'react';

import type { CardFilter } from '../model/cardFilter';

interface SectionResults {
  key: string;
  cards: readonly unknown[];
}

interface Narrowing {
  // Termo da busca já normalizado ('' = sem busca).
  term: string;
  filter: CardFilter;
  hasActiveFilter: boolean;
}

const NONE_COLLAPSED: ReadonlySet<string> = new Set();

// Abre as seções fechadas que têm algum cartão à mostra.
export function openSectionsWithResults(
  collapsed: ReadonlySet<string>,
  sections: readonly SectionResults[],
): ReadonlySet<string> {
  const withResults = sections.filter((section) => section.cards.length > 0);
  if (!withResults.some((section) => collapsed.has(section.key))) return collapsed;
  const next = new Set(collapsed);
  for (const section of withResults) next.delete(section.key);
  return next;
}

// Seções recolhíveis da tela "Arquivados": todas começam abertas e o estado vale só enquanto a tela
// está aberta. Cada mudança na busca ou no filtro abre as seções que têm resultado.
export function useArchivedSections(sections: readonly SectionResults[], narrowing: Narrowing) {
  const [collapsed, setCollapsed] = useState(NONE_COLLAPSED);
  const { term, filter, hasActiveFilter } = narrowing;
  const [seen, setSeen] = useState({ term, filter });

  // Ajuste durante a renderização (padrão do React para derivar estado de uma prop que mudou): as
  // seções já chegam com o resultado da busca nova, sem um quadro com a seção fechada.
  if (seen.term !== term || seen.filter !== filter) {
    setSeen({ term, filter });
    if (term.length > 0 || hasActiveFilter) {
      setCollapsed((previous) => openSectionsWithResults(previous, sections));
    }
  }

  const toggle = useCallback((key: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isExpanded = useCallback((key: string) => !collapsed.has(key), [collapsed]);

  return { isExpanded, toggle };
}
