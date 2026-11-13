import { useEffect, useRef } from 'react';

// Só em desenvolvimento: avisa quando um valor que deveria ter identidade fixa (ex.: o objeto
// `drag` do quadro, que todas as colunas e cartões memoizados recebem) muda entre renders. Uma
// mudança dessas redesenha a árvore inteira sem ninguém perceber; o aviso aponta o culpado cedo.
export function useIdentityWarning(value: unknown, label: string) {
  const previous = useRef(value);
  useEffect(() => {
    if (!__DEV__ || previous.current === value) return;
    previous.current = value;
    console.warn(`[identidade] "${label}" mudou de identidade entre renders.`);
  }, [value, label]);
}
