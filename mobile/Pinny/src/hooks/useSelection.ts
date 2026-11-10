import { useCallback, useMemo, useState } from 'react';

// Modo de seleção como o das fotos do iOS: começa vazio, cada toque marca ou desmarca, na ordem da
// escolha. Base da seleção de quadros (tela da pasta) e de cartões (quadro).
export function useSelection() {
  // null = fora do modo de seleção.
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const selected = useMemo(() => selectedIds ?? [], [selectedIds]);

  const start = useCallback(() => setSelectedIds([]), []);
  const cancel = useCallback(() => setSelectedIds(null), []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      if (!current) return current;
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  }, []);

  // Marca vários de uma vez (ex.: "Selecionar todos" da coluna), sem repetir os já marcados.
  const selectMany = useCallback((ids: readonly string[]) => {
    setSelectedIds((current) => {
      if (!current) return current;
      const added = ids.filter((id) => !current.includes(id));
      return added.length > 0 ? [...current, ...added] : current;
    });
  }, []);

  // Desmarca vários de uma vez (ex.: "Limpar" da coluna).
  const deselectMany = useCallback((ids: readonly string[]) => {
    setSelectedIds((current) => {
      if (!current) return current;
      const remaining = current.filter((id) => !ids.includes(id));
      return remaining.length === current.length ? current : remaining;
    });
  }, []);

  return {
    isSelecting: selectedIds !== null,
    selectedIds: selected,
    count: selected.length,
    start,
    cancel,
    toggle,
    selectMany,
    deselectMany,
  };
}
