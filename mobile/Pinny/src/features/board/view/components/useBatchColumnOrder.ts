import { type SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import type { BatchDrag } from './boardDrag.types';

interface BatchColumnOrderOptions {
  batch: BatchDrag;
  activeId: SharedValue<string | null>;
  order: SharedValue<string[]>;
  // Última ordem recebida do banco (com os levantados).
  sourceIds: SharedValue<string[]>;
  // Vaga de partida do cartão segurado nesta coluna (para saber se ele andou).
  startIndex: SharedValue<number>;
}

// Arraste em lote, numa coluna: os outros marcados saem da ordem quando a pilha começa (os
// vizinhos deslizam e fecham o espaço) e voltam quando ela é cancelada. Na UI thread: durante um
// arraste, a ordem que vem do React não é aplicada.
export function useBatchColumnOrder({
  batch,
  activeId,
  order,
  sourceIds,
  startIndex,
}: BatchColumnOrderOptions) {
  const { liftedIds, restoreToken } = batch;

  useAnimatedReaction(
    () => liftedIds.get(),
    (lifted) => {
      if (lifted.length === 0) return;
      const current = order.get();
      const next = current.filter((id) => !lifted.includes(id));
      if (next.length === current.length) return;
      order.set(next);
      // Sem os de cima, o segurado (se for desta coluna) muda de índice sem ter andado.
      const held = activeId.get();
      if (held !== null && next.includes(held)) startIndex.set(next.indexOf(held));
    },
  );

  useAnimatedReaction(
    () => restoreToken.get(),
    (token, previous) => {
      if (previous === null || previous === undefined || token === previous) return;
      order.set(sourceIds.get());
    },
  );
}

// Volta a ordem da coluna à última vinda do banco (com os levantados), na hora: o cartão segurado
// calcula onde assenta logo em seguida.
export function restoreColumnOrder(order: SharedValue<string[]>, sourceIds: SharedValue<string[]>) {
  'worklet';
  order.set(sourceIds.get());
}
