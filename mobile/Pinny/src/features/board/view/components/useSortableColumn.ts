import { useEffect } from 'react';
import type { View } from 'react-native';
import Animated, {
  type AnimatedRef,
  type DerivedValue,
  scrollTo,
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { computeOffsets, indexFromCenter, moveIndex, totalHeight } from '../../model/reorder';
import { autoScroll } from '@/theme';

// Espaço entre os cartões e altura usada antes de o cartão ser medido (Figma: 110 + 10).
export const CARD_GAP = 10;
export const ESTIMATED_CARD_HEIGHT = 110;

interface SortableColumnOptions {
  columnId: string;
  ids: readonly string[];
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onMove: (columnId: string, cardId: string, toIndex: number) => void;
  onLift: () => void;
  onTick: () => void;
  onDrop: () => void;
}

export interface SortableColumn {
  order: SharedValue<string[]>;
  heights: SharedValue<Record<string, number>>;
  offsets: DerivedValue<Record<string, number>>;
  contentHeight: DerivedValue<number>;
  // true quando todos os cartões já foram medidos (a partir daí, mudanças deslizam).
  isLaidOut: DerivedValue<boolean>;
  activeId: SharedValue<string | null>;
  // Topo do cartão arrastado, em coordenadas da lista (acompanha o dedo e a rolagem automática).
  dragTop: DerivedValue<number>;
  viewportHeight: SharedValue<number>;
  // Onde a lista começa dentro da coluna (abaixo do cabeçalho fixo) e a altura de todo o conteúdo.
  listTop: SharedValue<number>;
  scrollContentHeight: SharedValue<number>;
  // Rolagem da coluna (negativa quando puxada para baixo além do topo).
  scrollY: SharedValue<number>;
  isUserScrolling: SharedValue<boolean>;
  // Lista dos cartões (sem transform), medida para posicionar o cartão na camada de arraste.
  listRef: AnimatedRef<View>;
  startDrag: (id: string) => void;
  updateDrag: (translationY: number) => void;
  // Solta o cartão e devolve o topo da vaga final.
  endDrag: () => number;
}

// Estado do arraste de uma coluna, todo na UI thread. A ordem visual (order) muda durante o
// gesto; o React só fica sabendo uma vez, ao soltar (onMove).
export function useSortableColumn({
  columnId,
  ids,
  scrollRef,
  onMove,
  onLift,
  onTick,
  onDrop,
}: SortableColumnOptions): {
  column: SortableColumn;
  // Fica fora do objeto da coluna: os worklets capturam esse objeto, e o manipulador de rolagem
  // não pode ser copiado para a UI thread.
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
} {
  const order = useSharedValue<string[]>([...ids]);
  const heights = useSharedValue<Record<string, number>>({});
  const activeId = useSharedValue<string | null>(null);
  const startIndex = useSharedValue(-1);
  const startTop = useSharedValue(0);
  const startScroll = useSharedValue(0);
  const translationY = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const listTop = useSharedValue(0);
  const scrollContentHeight = useSharedValue(0);
  const listRef = useAnimatedRef<View>();
  const scrollY = useSharedValue(0);
  // true enquanto o dedo está rolando a coluna (usado pelo "puxar para excluir").
  const isUserScrolling = useSharedValue(false);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
    onBeginDrag: () => {
      isUserScrolling.set(true);
    },
    onEndDrag: () => {
      isUserScrolling.set(false);
    },
  });

  // A ordem vinda do banco só é aplicada fora de um arraste, na própria UI thread.
  const idsKey = ids.join();
  useEffect(() => {
    const nextIds = idsKey ? idsKey.split(',') : [];
    scheduleOnUI(() => {
      'worklet';
      if (activeId.get() === null) order.set(nextIds);
    });
  }, [idsKey, activeId, order]);

  const offsets = useDerivedValue(() =>
    computeOffsets(order.get(), heights.get(), CARD_GAP, ESTIMATED_CARD_HEIGHT),
  );
  const contentHeight = useDerivedValue(() =>
    totalHeight(order.get(), heights.get(), CARD_GAP, ESTIMATED_CARD_HEIGHT),
  );
  const isLaidOut = useDerivedValue(() =>
    order.get().every((id) => heights.get()[id] !== undefined),
  );
  const dragTop = useDerivedValue(
    () => startTop.get() + translationY.get() + scrollY.get() - startScroll.get(),
  );

  // Troca de vaga ao passar do meio de um vizinho, tanto pelo dedo quanto pela rolagem automática.
  useAnimatedReaction(
    () => {
      const id = activeId.get();
      if (id === null) return -1;
      const center = dragTop.get() + (heights.get()[id] ?? ESTIMATED_CARD_HEIGHT) / 2;
      return indexFromCenter(
        center,
        id,
        order.get(),
        offsets.get(),
        heights.get(),
        ESTIMATED_CARD_HEIGHT,
      );
    },
    (target) => {
      const id = activeId.get();
      if (id === null || target < 0) return;
      const current = order.get().indexOf(id);
      if (current === target) return;
      order.set(moveIndex(order.get(), current, target));
      scheduleOnRN(onTick);
    },
  );

  // Rola a coluna quando o cartão chega perto da borda: mais rápido quanto mais perto.
  // A borda de cima fica logo abaixo do cabeçalho fixo (listTop), que cobre o topo da coluna.
  useFrameCallback(() => {
    const id = activeId.get();
    if (id === null || viewportHeight.get() === 0) return;

    const top = listTop.get() + dragTop.get() - scrollY.get();
    const bottom = top + (heights.get()[id] ?? ESTIMATED_CARD_HEIGHT);
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

  const startDrag = (id: string) => {
    'worklet';
    activeId.set(id);
    startIndex.set(order.get().indexOf(id));
    startTop.set(offsets.get()[id] ?? 0);
    startScroll.set(scrollY.get());
    translationY.set(0);
    scheduleOnRN(onLift);
  };

  const updateDrag = (nextTranslationY: number) => {
    'worklet';
    translationY.set(nextTranslationY);
  };

  const endDrag = () => {
    'worklet';
    const id = activeId.get();
    if (id === null) return 0;
    const finalIndex = order.get().indexOf(id);
    if (finalIndex !== startIndex.get()) scheduleOnRN(onMove, columnId, id, finalIndex);
    scheduleOnRN(onDrop);
    activeId.set(null);
    return offsets.get()[id] ?? 0;
  };

  return {
    scrollHandler,
    column: {
      order,
      heights,
      offsets,
      contentHeight,
      isLaidOut,
      activeId,
      dragTop,
      viewportHeight,
      listTop,
      scrollContentHeight,
      scrollY,
      isUserScrolling,
      listRef,
      startDrag,
      updateDrag,
      endDrag,
    },
  };
}
