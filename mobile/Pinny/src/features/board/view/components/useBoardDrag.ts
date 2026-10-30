import { useCallback, useEffect, useState } from 'react';
import type { View } from 'react-native';
import Animated, {
  type AnimatedRef,
  measure,
  scrollTo,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { autoScroll, dragSpring, duration } from '@/theme';

import { columnIndexAt } from '../../model/reorder';

interface BoardDragOptions {
  columnIds: readonly string[];
  // Largura de uma coluna mais o espaço entre elas (uma "página" da rolagem do quadro).
  pitch: number;
  gap: number;
  // Recuo da primeira coluna em relação à borda da tela.
  gutter: number;
  onMove: (cardId: string, toColumnId: string, toIndex: number) => void;
  onDrop: () => void;
}

export interface BoardDrag {
  // Qual cartão desenhar na camada (estado do React, só para o conteúdo).
  activeCardId: string | null;
  activeId: SharedValue<string | null>;
  fromColumnId: SharedValue<string | null>;
  // Coluna sob o dedo: é nela que a vaga aparece.
  overColumnId: SharedValue<string | null>;
  // Altura medida de todos os cartões do quadro (os ids não se repetem entre colunas).
  heights: SharedValue<Record<string, number>>;
  // Cópia do cartão na camada: posição inicial (x, startY) mais o deslocamento do dedo.
  x: SharedValue<number>;
  startY: SharedValue<number>;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  width: SharedValue<number>;
  lift: SharedValue<number>;
  // Cartão cujo fantasma já está desenhado: os cartões com esse id nas colunas ficam invisíveis.
  visibleId: SharedValue<string | null>;
  // Topo das listas das colunas na camada, com a rolagem da coluna em zero (é igual em todas).
  listOriginY: SharedValue<number>;
  // Vaga na coluna sob o dedo, escrita por ela.
  slotIndex: SharedValue<number>;
  // Cartão solto em outra coluna, esperando aparecer lá para assumir do fantasma.
  landingId: SharedValue<string | null>;
  landingColumnId: SharedValue<string | null>;
  boardViewportWidth: SharedValue<number>;
  boardContentWidth: SharedValue<number>;
  begin: (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    offset: number,
    columnScrollY: number,
    absoluteX: number,
  ) => void;
  move: (translationX: number, translationY: number, absoluteX: number) => void;
  // Distância horizontal entre o fantasma e a lista de origem (para o cartão assumir dali).
  horizontalOffset: () => number;
  // Soltou na própria coluna: o arraste acaba e o cartão assenta na vaga (settle).
  release: () => void;
  // Soltou em outra coluna: o fantasma espera o cartão aparecer lá (takeOver).
  dropInOtherColumn: () => void;
  takeOver: (columnScrollY: number) => { top: number; left: number };
  // Quique ao assentar, desenhado pelo fantasma (por cima de tudo) na posição da vaga dentro da
  // lista: a coluna mede a lista a cada quadro (trackSettle), então ele acompanha as rolagens.
  settleId: SharedValue<string | null>;
  settleColumnId: SharedValue<string | null>;
  settleTop: SharedValue<number>;
  settleLeft: SharedValue<number>;
  settleLift: SharedValue<number>;
  settleListX: SharedValue<number>;
  settleListY: SharedValue<number>;
  settle: (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    from: { top: number; left: number },
    target: number,
    isReducedMotion: boolean,
  ) => void;
  trackSettle: (listRef: AnimatedRef<View>) => void;
  markVisible: (id: string) => void;
}

// Arraste no nível do quadro, todo na UI thread: a camada com o cartão segurado (por cima de
// tudo), qual coluna está sob o dedo e a rolagem automática do quadro para os lados.
export function useBoardDrag({ columnIds, pitch, gap, gutter, onMove, onDrop }: BoardDragOptions): {
  drag: BoardDrag;
  // Fora do objeto do arraste: os worklets o capturam, e o manipulador de rolagem não pode ser
  // copiado para a UI thread. As refs também ficam fora (o React Compiler não aceita ler ref de
  // dentro de um objeto durante o render).
  boardScrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  // Camada do fantasma (origem das medidas) e rolagem do quadro.
  originRef: AnimatedRef<View>;
  boardScrollRef: AnimatedRef<Animated.ScrollView>;
} {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const originRef = useAnimatedRef<View>();
  const boardScrollRef = useAnimatedRef<Animated.ScrollView>();
  const activeId = useSharedValue<string | null>(null);
  const fromColumnId = useSharedValue<string | null>(null);
  const overColumnId = useSharedValue<string | null>(null);
  const heights = useSharedValue<Record<string, number>>({});
  const x = useSharedValue(0);
  const startY = useSharedValue(0);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const width = useSharedValue(0);
  const lift = useSharedValue(0);
  const visibleId = useSharedValue<string | null>(null);
  const listOriginY = useSharedValue(0);
  const slotIndex = useSharedValue(-1);
  const landingId = useSharedValue<string | null>(null);
  const landingColumnId = useSharedValue<string | null>(null);
  const landingShift = useSharedValue(0);
  const settleId = useSharedValue<string | null>(null);
  const settleColumnId = useSharedValue<string | null>(null);
  const settleTop = useSharedValue(0);
  const settleLeft = useSharedValue(0);
  const settleLift = useSharedValue(0);
  const settleListX = useSharedValue(0);
  const settleListY = useSharedValue(0);
  const originPageY = useSharedValue(0);
  const boardViewportWidth = useSharedValue(0);
  const boardContentWidth = useSharedValue(0);
  const boardScrollX = useSharedValue(0);
  const beginScrollX = useSharedValue(0);
  const originPageX = useSharedValue(0);
  // Posição do dedo na camada.
  const fingerX = useSharedValue(0);
  const layout = useSharedValue({ columnIds: [...columnIds], pitch, gap, gutter });

  const columnsKey = columnIds.join();
  useEffect(() => {
    layout.set({ columnIds: columnsKey ? columnsKey.split(',') : [], pitch, gap, gutter });
  }, [columnsKey, pitch, gap, gutter, layout]);

  const boardScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      boardScrollX.set(event.contentOffset.x);
    },
  });

  // Coluna sob o dedo, tanto quando o dedo anda quanto quando o quadro rola sozinho.
  useAnimatedReaction(
    () => {
      if (activeId.get() === null) return null;
      const { columnIds: ids, pitch: step, gap: space, gutter: inset } = layout.get();
      const index = columnIndexAt(
        fingerX.get() + boardScrollX.get() - inset,
        step,
        space,
        ids.length,
      );
      return ids[index] ?? null;
    },
    (next) => {
      if (next === null || next === overColumnId.get()) return;
      // A vaga anterior era de outra coluna: a nova coluna escreve a dela logo em seguida.
      slotIndex.set(-1);
      overColumnId.set(next);
    },
  );

  // Rola o quadro quando o dedo chega perto da borda da tela: mais rápido quanto mais perto.
  useFrameCallback(() => {
    const viewport = boardViewportWidth.get();
    if (activeId.get() === null || viewport === 0) return;

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

    const maxScroll = Math.max(0, boardContentWidth.get() - viewport);
    const next = Math.min(maxScroll, Math.max(0, boardScrollX.get() + delta));
    if (next !== boardScrollX.get()) scrollTo(boardScrollRef, next, 0, false);
  });

  // Ao soltar, encaixa o quadro na coluna onde o cartão caiu (não na mais próxima da rolagem:
  // quem leva o cartão à coluna que aparece pela borda quer ver essa coluna).
  const snapBoard = (columnId: string) => {
    'worklet';
    const { columnIds: ids, pitch: step } = layout.get();
    const index = ids.indexOf(columnId);
    if (index < 0) return;
    const maxScroll = Math.max(0, boardContentWidth.get() - boardViewportWidth.get());
    const target = Math.min(maxScroll, index * step);
    if (target !== boardScrollX.get()) scrollTo(boardScrollRef, target, 0, true);
  };

  const clear = () => {
    'worklet';
    activeId.set(null);
    fromColumnId.set(null);
    overColumnId.set(null);
    slotIndex.set(-1);
  };

  const hide = () => {
    'worklet';
    visibleId.set(null);
    lift.set(0);
    scheduleOnRN(setActiveCardId, null);
  };

  // A posição vem da lista da coluna (sem transform) mais o topo do cartão nela.
  const begin = (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    offset: number,
    columnScrollY: number,
    absoluteX: number,
  ) => {
    'worklet';
    const list = measure(listRef);
    const origin = measure(originRef);
    if (!list || !origin) return;
    // Um quique ainda em andamento termina aqui: aquele cartão volta a aparecer na lista.
    settleId.set(null);
    settleColumnId.set(null);
    visibleId.set(null);
    originPageX.set(origin.pageX);
    originPageY.set(origin.pageY);
    x.set(list.pageX - origin.pageX);
    listOriginY.set(list.pageY - origin.pageY + columnScrollY);
    startY.set(list.pageY - origin.pageY + offset);
    width.set(list.width);
    translationX.set(0);
    translationY.set(0);
    fingerX.set(absoluteX - origin.pageX);
    beginScrollX.set(boardScrollX.get());
    activeId.set(id);
    fromColumnId.set(columnId);
    overColumnId.set(columnId);
    lift.set(withTiming(1, { duration: duration.fast }));
    scheduleOnRN(setActiveCardId, id);
  };

  const move = (nextTranslationX: number, nextTranslationY: number, absoluteX: number) => {
    'worklet';
    translationX.set(nextTranslationX);
    translationY.set(nextTranslationY);
    fingerX.set(absoluteX - originPageX.get());
  };

  const horizontalOffset = () => {
    'worklet';
    return translationX.get() + boardScrollX.get() - beginScrollX.get();
  };

  const release = () => {
    'worklet';
    const from = fromColumnId.get();
    clear();
    if (from !== null) snapBoard(from);
  };

  // Soltou em outra coluna: o fantasma para onde está e o React move o cartão. Quando o cartão
  // aparece na coluna de destino, ele assume daqui (takeOver) e assenta dentro da própria lista,
  // acompanhando qualquer rolagem, como na mesma coluna.
  const dropInOtherColumn = () => {
    'worklet';
    const id = activeId.get();
    const from = fromColumnId.get();
    const to = overColumnId.get();
    const index = slotIndex.get();
    if (id === null || from === null || to === null || index < 0) return;

    const ids = layout.get().columnIds;
    landingShift.set((ids.indexOf(to) - ids.indexOf(from)) * layout.get().pitch);
    landingColumnId.set(to);
    landingId.set(id);
    clear();
    snapBoard(to);
    scheduleOnRN(onMove, id, to, index);
    scheduleOnRN(onDrop);
  };

  // O cartão que acabou de chegar pega a posição atual do fantasma, em coordenadas da lista dele.
  const takeOver = (columnScrollY: number) => {
    'worklet';
    const top = startY.get() + translationY.get() - listOriginY.get() + columnScrollY;
    const left = translationX.get() - landingShift.get() + boardScrollX.get() - beginScrollX.get();
    landingId.set(null);
    landingColumnId.set(null);
    return { top, left };
  };

  const placeSettle = (listRef: AnimatedRef<View>) => {
    'worklet';
    const list = measure(listRef);
    if (!list) return false;
    settleListX.set(list.pageX - originPageX.get());
    settleListY.set(list.pageY - originPageY.get());
    return true;
  };

  const settle = (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    from: { top: number; left: number },
    target: number,
    isReducedMotion: boolean,
  ) => {
    'worklet';
    settleId.set(id);
    settleColumnId.set(columnId);
    if (!placeSettle(listRef)) {
      settleId.set(null);
      settleColumnId.set(null);
      hide();
      return;
    }
    // Ao parar, o cartão da lista (já na vaga) reaparece e o fantasma some, se outro arraste não
    // tiver começado no meio.
    const onSettled = () => {
      'worklet';
      if (settleId.get() !== id || activeId.get() !== null) return;
      settleId.set(null);
      settleColumnId.set(null);
      hide();
    };
    settleTop.set(from.top);
    settleLeft.set(from.left);
    settleLift.set(1);
    if (isReducedMotion) {
      settleTop.set(withTiming(target, { duration: duration.fast }, onSettled));
      settleLeft.set(withTiming(0, { duration: duration.fast }));
    } else {
      settleTop.set(withSpring(target, dragSpring, onSettled));
      settleLeft.set(withSpring(0, dragSpring));
    }
    settleLift.set(withTiming(0, { duration: duration.normal }));
  };

  const trackSettle = (listRef: AnimatedRef<View>) => {
    'worklet';
    placeSettle(listRef);
  };

  const markVisible = useCallback((id: string) => visibleId.set(id), [visibleId]);

  return {
    boardScrollHandler,
    originRef,
    boardScrollRef,
    drag: {
      activeCardId,
      activeId,
      fromColumnId,
      overColumnId,
      heights,
      x,
      startY,
      translationX,
      translationY,
      width,
      lift,
      visibleId,
      listOriginY,
      slotIndex,
      landingId,
      landingColumnId,
      boardViewportWidth,
      boardContentWidth,
      begin,
      move,
      horizontalOffset,
      release,
      dropInOtherColumn,
      takeOver,
      settleId,
      settleColumnId,
      settleTop,
      settleLeft,
      settleLift,
      settleListX,
      settleListY,
      settle,
      trackSettle,
      markVisible,
    },
  };
}
