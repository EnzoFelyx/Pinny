import type { View } from 'react-native';
import Animated, {
  type AnimatedRef,
  type DerivedValue,
  scrollTo,
  type SharedValue,
  useFrameCallback,
} from 'react-native-reanimated';

import { autoScroll } from '@/theme';

import type { BoardDrag } from './useBoardDrag';
import { ESTIMATED_CARD_HEIGHT } from './sortableColumn.types';

interface ColumnAutoScrollOptions {
  columnId: string;
  drag: BoardDrag;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  listRef: AnimatedRef<View>;
  // Topo do cartão arrastado nas coordenadas da lista desta coluna.
  dragTop: DerivedValue<number>;
  viewportHeight: SharedValue<number>;
  listTop: SharedValue<number>;
  scrollContentHeight: SharedValue<number>;
  scrollY: SharedValue<number>;
  isUserScrolling: SharedValue<boolean>;
}

// A cada quadro, na UI thread: rola a coluna sob o dedo quando o cartão chega perto da borda (mais
// rápido quanto mais perto) e mantém o quique do cartão que assenta nesta coluna grudado na lista
// (ou o passa para dentro dela, se a coluna for rolada).
// A borda de cima fica logo abaixo do cabeçalho fixo (listTop), que cobre o topo da coluna.
export function useColumnAutoScroll({
  columnId,
  drag,
  scrollRef,
  listRef,
  dragTop,
  viewportHeight,
  listTop,
  scrollContentHeight,
  scrollY,
  isUserScrolling,
}: ColumnAutoScrollOptions) {
  useFrameCallback(() => {
    if (drag.settleColumnId.get() === columnId) {
      // Rolando a coluna, o quique passa para dentro da lista (não vaza por cima do quadro).
      if (isUserScrolling.get()) drag.handOff();
      else drag.trackSettle(listRef);
    }
    const id = drag.activeId.get();
    if (id === null || drag.overColumnId.get() !== columnId || viewportHeight.get() === 0) return;

    const top = listTop.get() + dragTop.get() - scrollY.get();
    const bottom = top + (drag.heights.get()[id] ?? ESTIMATED_CARD_HEIGHT);
    const upperEdge = listTop.get() + autoScroll.edge;
    const lowerEdge = viewportHeight.get() - autoScroll.edge;
    let delta = 0;
    if (top < upperEdge) {
      delta = -autoScroll.maxSpeed * Math.min(1, (upperEdge - top) / autoScroll.edge);
    } else if (bottom > lowerEdge) {
      delta = autoScroll.maxSpeed * Math.min(1, (bottom - lowerEdge) / autoScroll.edge);
    }
    if (delta === 0) return;

    const maxScroll = Math.max(0, scrollContentHeight.get() - viewportHeight.get());
    const next = Math.min(maxScroll, Math.max(0, scrollY.get() + delta));
    if (next !== scrollY.get()) scrollTo(scrollRef, 0, next, false);
  });
}
