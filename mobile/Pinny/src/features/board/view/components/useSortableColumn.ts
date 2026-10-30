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

import type { BoardDrag } from './useBoardDrag';

// Espaço entre os cartões e altura usada antes de o cartão ser medido (Figma: 110 + 10).
export const CARD_GAP = 10;
export const ESTIMATED_CARD_HEIGHT = 110;

// Resultado da vaga do cartão arrastado nesta coluna: fora de um arraste ou fora da coluna.
const NO_DRAG = -2;
const OUTSIDE = -1;

interface SortableColumnOptions {
  columnId: string;
  ids: readonly string[];
  scrollRef: AnimatedRef<Animated.ScrollView>;
  drag: BoardDrag;
  onMove: (cardId: string, toColumnId: string, toIndex: number) => void;
  onLift: () => void;
  onTick: () => void;
  onDrop: () => void;
}

export interface SortableColumn {
  order: SharedValue<string[]>;
  offsets: DerivedValue<Record<string, number>>;
  contentHeight: DerivedValue<number>;
  // true quando todos os cartões já foram medidos (a partir daí, mudanças deslizam).
  isLaidOut: DerivedValue<boolean>;
  // Topo do cartão arrastado nas coordenadas desta lista (acompanha o dedo e as rolagens).
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
  // Solta o cartão na própria coluna e devolve o topo da vaga final.
  endDrag: () => number;
}

// Ordem visual de uma coluna, toda na UI thread. Durante o arraste, o cartão entra na ordem da
// coluna que está sob o dedo e sai das outras; o React só fica sabendo ao soltar (onMove).
export function useSortableColumn({
  columnId,
  ids,
  scrollRef,
  drag,
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
  const { activeId, heights } = drag;
  const order = useSharedValue<string[]>([...ids]);
  const startIndex = useSharedValue(-1);
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
    () => drag.startY.get() + drag.translationY.get() - drag.listOriginY.get() + scrollY.get(),
  );

  // Vaga do cartão nesta coluna: entra quando a coluna fica sob o dedo, troca de lugar ao passar
  // do meio de um vizinho (pelo dedo ou pela rolagem automática) e sai quando o dedo vai embora.
  useAnimatedReaction(
    () => {
      const id = activeId.get();
      if (id === null) return NO_DRAG;
      if (drag.overColumnId.get() !== columnId) return OUTSIDE;
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
      if (id === null || target === NO_DRAG) return;
      const current = order.get();
      const index = current.indexOf(id);
      if (target === OUTSIDE) {
        if (index >= 0) order.set(current.filter((item) => item !== id));
        return;
      }
      if (index === target) return;
      order.set(
        index < 0
          ? [...current.slice(0, target), id, ...current.slice(target)]
          : moveIndex(current, index, target),
      );
      scheduleOnRN(onTick);
    },
  );

  // A coluna sob o dedo informa a vaga ao quadro, para o cartão saber onde cair ao soltar.
  useAnimatedReaction(
    () => {
      const id = activeId.get();
      if (id === null || drag.overColumnId.get() !== columnId) return null;
      const index = order.get().indexOf(id);
      return index < 0 ? null : index;
    },
    (index) => {
      if (index !== null) drag.slotIndex.set(index);
    },
  );

  // Rola a coluna sob o dedo quando o cartão chega perto da borda: mais rápido quanto mais perto.
  // A borda de cima fica logo abaixo do cabeçalho fixo (listTop), que cobre o topo da coluna.
  // Também mantém o quique do cartão que assenta nesta coluna grudado na lista (rolagens incluídas).
  useFrameCallback(() => {
    if (drag.settleColumnId.get() === columnId) drag.trackSettle(listRef);
    const id = activeId.get();
    if (id === null || drag.overColumnId.get() !== columnId || viewportHeight.get() === 0) return;

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
    startIndex.set(order.get().indexOf(id));
    scheduleOnRN(onLift);
  };

  const endDrag = () => {
    'worklet';
    const id = activeId.get();
    if (id === null) return 0;
    let finalIndex = order.get().indexOf(id);
    // Sem vaga aqui (o dedo saiu e o arraste acabou sem destino): volta ao lugar de antes.
    if (finalIndex < 0) {
      finalIndex = Math.max(0, startIndex.get());
      const current = order.get();
      order.set([...current.slice(0, finalIndex), id, ...current.slice(finalIndex)]);
    }
    if (finalIndex !== startIndex.get()) scheduleOnRN(onMove, id, columnId, finalIndex);
    scheduleOnRN(onDrop);
    // Calculado na hora: o valor derivado (offsets) só se atualiza no próximo quadro.
    return computeOffsets(order.get(), heights.get(), CARD_GAP, ESTIMATED_CARD_HEIGHT)[id] ?? 0;
  };

  return {
    scrollHandler,
    column: {
      order,
      offsets,
      contentHeight,
      isLaidOut,
      dragTop,
      viewportHeight,
      listTop,
      scrollContentHeight,
      scrollY,
      isUserScrolling,
      listRef,
      startDrag,
      endDrag,
    },
  };
}
