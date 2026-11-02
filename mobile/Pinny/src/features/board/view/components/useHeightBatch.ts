import { useCallback, useRef } from 'react';
import type { SharedValue } from 'react-native-reanimated';

// Alturas medidas no mesmo quadro de animação entram juntas no mapa do quadro: uma cópia do mapa
// por quadro, e não uma por cartão (ao abrir um quadro cheio, centenas de cartões medem juntos, e
// cada cópia faz as colunas recalcularem as posições).
export function useHeightBatch(heights: SharedValue<Record<string, number>>) {
  const pending = useRef<Record<string, number> | null>(null);

  return useCallback(
    (id: string, height: number) => {
      if (pending.current === null) {
        pending.current = {};
        requestAnimationFrame(() => {
          const batch = pending.current ?? {};
          pending.current = null;
          heights.modify((current) => {
            'worklet';
            const changed = Object.keys(batch).some((key) => current[key] !== batch[key]);
            return changed ? { ...current, ...batch } : current;
          });
        });
      }
      pending.current[id] = height;
    },
    [heights],
  );
}
