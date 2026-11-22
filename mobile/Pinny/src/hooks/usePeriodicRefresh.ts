import { useEffect } from 'react';
import { AppState } from 'react-native';

// Chama refresh a cada intervalMs enquanto o app está à frente e uma vez ao voltar do segundo plano
// (ex.: o estado do prazo dos cartões muda só com o passar do tempo). Em segundo plano, o timer
// para. refresh deve ter identidade estável (useCallback), senão o timer reinicia a cada render.
export function usePeriodicRefresh(refresh: () => void, intervalMs: number): void {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer === null) timer = setInterval(refresh, intervalMs);
    };
    const stop = () => {
      if (timer !== null) clearInterval(timer);
      timer = null;
    };

    if (AppState.currentState === 'active') start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        start();
      } else {
        stop();
      }
    });
    return () => {
      stop();
      subscription.remove();
    };
  }, [refresh, intervalMs]);
}
