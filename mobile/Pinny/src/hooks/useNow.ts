import { useCallback, useState } from 'react';

import { usePeriodicRefresh } from './usePeriodicRefresh';

// O "agora" de uma tela, renovado a cada intervalMs com o app à frente e ao voltar do segundo
// plano (ex.: o estado do prazo do cartão).
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);
  usePeriodicRefresh(refresh, intervalMs);
  return now;
}
