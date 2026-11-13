import { useEffect, useState } from 'react';

// Colunas que aparecem na tela ao abrir (a terceira só aparece pela borda). As outras entram uma
// por quadro de animação, fora da vista.
const FIRST_PAINT_COLUMNS = 2;
// Montagem progressiva concluída: daí em diante, toda coluna nova (inclusive no meio do quadro,
// como a duplicada) entra direto, sem cortar a lista.
const ALL_COLUMNS = Number.POSITIVE_INFINITY;

// Ao sair do skeleton, monta primeiro só as colunas que aparecem na tela e depois uma coluna por
// quadro: montar tudo de uma vez travava a transição (num quadro cheio, por segundos).
export function useStagedColumns(isWaiting: boolean, total: number) {
  const [mountedCount, setMountedCount] = useState(FIRST_PAINT_COLUMNS);
  useEffect(() => {
    if (isWaiting || mountedCount === ALL_COLUMNS) return;
    const frame = requestAnimationFrame(() =>
      setMountedCount((count) => (count + 1 >= total ? ALL_COLUMNS : count + 1)),
    );
    return () => cancelAnimationFrame(frame);
  }, [isWaiting, mountedCount, total]);
  return { mountedCount, isFullyMounted: mountedCount === ALL_COLUMNS };
}
