import { measure, type SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import type { BatchDrag, BoardDrag } from './boardDrag.types';
import { ESTIMATED_CARD_HEIGHT, type SortableColumn } from './sortableColumn.types';

interface BatchOriginOptions {
  id: string;
  // Escondido pelo filtro: não tem lugar na tela de onde voar.
  isHidden: boolean;
  batch: BatchDrag;
  drag: BoardDrag;
  column: SortableColumn;
  // Topo do cartão na lista da coluna.
  top: SharedValue<number>;
}

// Quando este cartão entra na pilha do arraste em lote e está à vista, mede de onde ele sai
// voando: a lista da coluna mais o topo dele (o mesmo cálculo do cartão segurado), na camada de
// arraste. Fora da tela (outra coluna, longe na rolagem) não voa: aparece na pilha com fade.
// Lê só a lista da pilha, que muda ao começar e ao acabar o lote.
export function useBatchOrigin({ id, isHidden, batch, drag, column, top }: BatchOriginOptions) {
  const { stackIds, reportOrigin } = batch;
  const { originPageX, originPageY, heights, boardViewportWidth } = drag;
  const { listRef, listTop, scrollY, viewportHeight } = column;

  useAnimatedReaction(
    () => stackIds.get().includes(id),
    (isStacked, wasStacked) => {
      if (!isStacked || wasStacked || isHidden) return;
      const list = measure(listRef);
      if (!list) return;
      const x = list.pageX - originPageX.get();
      // À vista na horizontal: a coluna aparece, ao menos em parte, no quadro.
      if (x + list.width <= 0 || x >= boardViewportWidth.get()) return;
      // À vista na vertical: entre o cabeçalho fixo da coluna e o fim dela.
      const height = heights.get()[id] ?? ESTIMATED_CARD_HEIGHT;
      const topInColumn = listTop.get() + top.get() - scrollY.get();
      if (topInColumn + height <= listTop.get() || topInColumn >= viewportHeight.get()) return;
      reportOrigin(id, {
        x,
        y: list.pageY - originPageY.get() + top.get(),
        width: list.width,
      });
    },
  );
}
