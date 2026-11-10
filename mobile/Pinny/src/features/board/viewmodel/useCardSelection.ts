import { useMemo } from 'react';

import { useSelection } from '@/hooks/useSelection';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.board.selection;

// Modo "Selecionar cartões" do quadro, como a seleção de fotos do iOS: começa vazio e cada toque
// marca ou desmarca. Enquanto seleciona, o arraste fica desligado. As ações sobre os escolhidos
// (mover, excluir) entram depois.
export function useCardSelection() {
  const { isSelecting, selectedIds, count, start, cancel, toggle, selectMany, deselectMany } =
    useSelection();
  // Set para cada coluna perguntar "este cartão está marcado?" sem percorrer a lista.
  const selectedSet = useMemo<ReadonlySet<string> | null>(
    () => (isSelecting ? new Set(selectedIds) : null),
    [isSelecting, selectedIds],
  );

  return {
    isSelecting,
    // null = fora do modo.
    selectedIds: selectedSet,
    title: text.title(count),
    hint: text.hint,
    start,
    cancel,
    toggle,
    selectMany,
    deselectMany,
  };
}
