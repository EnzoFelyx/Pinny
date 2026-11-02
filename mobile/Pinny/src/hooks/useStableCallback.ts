import { useCallback, useLayoutEffect, useRef } from 'react';

// Função com identidade fixa que sempre chama a versão mais recente de `callback`. Serve para
// repassar ações a listas memoizadas (ex.: colunas e cartões do quadro) sem redesenhá-las toda vez
// que os dados mudam e a ação é recriada.
export function useStableCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback;
  });
  return useCallback((...args: Args) => latest.current(...args), []);
}
