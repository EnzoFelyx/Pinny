import { useCallback, useEffect } from 'react';
import Animated, {
  scrollTo,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

import { autoScroll } from '@/theme';

export interface BoardLayout {
  columnIds: string[];
  // Largura de uma coluna mais o espaço entre elas (uma "página" da rolagem do quadro).
  pitch: number;
  gap: number;
  // Recuo da primeira coluna em relação à borda da tela.
  gutter: number;
}

interface BoardScrollOptions {
  columnIds: readonly string[];
  pitch: number;
  gap: number;
  gutter: number;
  // Cartão segurado (null = sem arraste) ou coluna segurada, e posição do dedo na camada.
  activeId: SharedValue<string | null>;
  isColumnHolding: SharedValue<boolean>;
  fingerX: SharedValue<number>;
}

// Rolagem horizontal do quadro, na UI thread: rola sozinha quando o dedo do arraste chega perto
// da borda da tela, encaixa numa coluna (ao soltar) e foca uma coluna pedida (ex.: recém-criada).
export function useBoardScroll({
  columnIds,
  pitch,
  gap,
  gutter,
  activeId,
  isColumnHolding,
  fingerX,
}: BoardScrollOptions) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const viewportWidth = useSharedValue(0);
  const contentWidth = useSharedValue(0);
  const layout = useSharedValue<BoardLayout>({ columnIds: [...columnIds], pitch, gap, gutter });

  const columnsKey = columnIds.join();
  useEffect(() => {
    layout.set({ columnIds: columnsKey ? columnsKey.split(',') : [], pitch, gap, gutter });
  }, [columnsKey, pitch, gap, gutter, layout]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
  });

  // Rola o quadro quando o dedo chega perto da borda da tela: mais rápido quanto mais perto.
  useFrameCallback(() => {
    const viewport = viewportWidth.get();
    if ((activeId.get() === null && !isColumnHolding.get()) || viewport === 0) return;

    const finger = fingerX.get();
    const lowerEdge = autoScroll.boardEdge;
    const upperEdge = viewport - autoScroll.boardEdge;
    let delta = 0;
    if (finger < lowerEdge) {
      delta = -autoScroll.boardMaxSpeed * Math.min(1, (lowerEdge - finger) / autoScroll.boardEdge);
    } else if (finger > upperEdge) {
      delta = autoScroll.boardMaxSpeed * Math.min(1, (finger - upperEdge) / autoScroll.boardEdge);
    }
    if (delta === 0) return;

    const maxScroll = Math.max(0, contentWidth.get() - viewport);
    const next = Math.min(maxScroll, Math.max(0, scrollX.get() + delta));
    if (next !== scrollX.get()) scrollTo(scrollRef, next, 0, false);
  });

  // Encaixa o quadro na coluna pedida (ao soltar um cartão: a coluna onde ele caiu, não a mais
  // próxima da rolagem, porque quem leva o cartão à coluna da borda quer ver essa coluna).
  // Encaixa o quadro na posição index e devolve a rolagem final (para animar junto).
  const snapToIndex = (index: number) => {
    'worklet';
    const maxScroll = Math.max(0, contentWidth.get() - viewportWidth.get());
    const target = Math.min(maxScroll, Math.max(0, index * layout.get().pitch));
    if (target !== scrollX.get()) scrollTo(scrollRef, target, 0, true);
    return target;
  };

  const snapToColumn = (columnId: string) => {
    'worklet';
    const index = layout.get().columnIds.indexOf(columnId);
    if (index >= 0) snapToIndex(index);
  };

  // A coluna pedida pode ainda não estar no layout (o React desenha depois): espera ela entrar
  // nas colunas e o conteúdo crescer o bastante, e então encaixa o quadro nela.
  const pendingFocusId = useSharedValue<string | null>(null);
  useAnimatedReaction(
    () => {
      const id = pendingFocusId.get();
      if (id === null) return null;
      const index = layout.get().columnIds.indexOf(id);
      const maxScroll = Math.max(0, contentWidth.get() - viewportWidth.get());
      return index >= 0 && maxScroll >= index * layout.get().pitch ? id : null;
    },
    (id) => {
      if (id === null) return;
      pendingFocusId.set(null);
      snapToColumn(id);
    },
  );
  const focusColumn = useCallback(
    (columnId: string) => pendingFocusId.set(columnId),
    [pendingFocusId],
  );

  return {
    scrollRef,
    scrollHandler,
    scrollX,
    viewportWidth,
    contentWidth,
    layout,
    snapToIndex,
    snapToColumn,
    focusColumn,
  };
}
