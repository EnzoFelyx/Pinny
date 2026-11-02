import { useCallback, useState } from 'react';
import type { View } from 'react-native';
import Animated, {
  type AnimatedRef,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  type useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { duration } from '@/theme';

import { columnIndexAt } from '../../model/reorder';
import { ADD_COLUMN_SLOT, type BoardDrag } from './boardDrag.types';
import { useBoardScroll } from './useBoardScroll';
import { useDragSettle } from './useDragSettle';
import { useDragValues } from './useDragValues';
import { useHeightBatch } from './useHeightBatch';

export type { BoardDrag } from './boardDrag.types';

interface BoardDragOptions {
  columnIds: readonly string[];
  // Largura de uma coluna mais o espaço entre elas (uma "página" da rolagem do quadro).
  pitch: number;
  gap: number;
  // Recuo da primeira coluna em relação à borda da tela.
  gutter: number;
  onMove: (cardId: string, toColumnId: string, toIndex: number) => void;
  onDrop: () => void;
  // Cartão solto na coluna "Adicionar coluna".
  onDropOnNewColumn: (cardId: string) => void;
}

// Arraste no nível do quadro, todo na UI thread: a camada com o cartão segurado (por cima de
// tudo) e qual coluna está sob o dedo. A rolagem do quadro fica em useBoardScroll e o quique ao
// soltar em useDragSettle.
export function useBoardDrag({
  columnIds,
  pitch,
  gap,
  gutter,
  onMove,
  onDrop,
  onDropOnNewColumn,
}: BoardDragOptions): {
  drag: BoardDrag;
  // Fora do objeto do arraste: os worklets o capturam, e o manipulador de rolagem não pode ser
  // copiado para a UI thread. As refs também ficam fora (o React Compiler não aceita ler ref de
  // dentro de um objeto durante o render).
  boardScrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  // Camada do fantasma (origem das medidas) e rolagem do quadro.
  originRef: AnimatedRef<View>;
  boardScrollRef: AnimatedRef<Animated.ScrollView>;
  // Qual cartão desenhar na camada (estado do React, só para o conteúdo). Fora de `drag`: mudar
  // ao segurar e ao soltar não pode trocar o objeto que todas as colunas e cartões recebem.
  activeCardId: string | null;
} {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const originRef = useAnimatedRef<View>();
  const values = useDragValues();
  const reportHeight = useHeightBatch(values.heights);
  const {
    activeId,
    fromColumnId,
    overColumnId,
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
    landingShift,
    originPageX,
    originPageY,
    beginScrollX,
    fingerX,
  } = values;

  // O manipulador de rolagem fica fora de `board`: os worklets abaixo capturam esse objeto, e o
  // manipulador não pode ser copiado para a UI thread.
  const { scrollHandler: boardScrollHandler, ...board } = useBoardScroll({
    columnIds,
    pitch,
    gap,
    gutter,
    activeId,
    fingerX,
  });

  // O fantasma some e o cartão da lista volta a aparecer.
  const hide = () => {
    'worklet';
    visibleId.set(null);
    lift.set(0);
    scheduleOnRN(setActiveCardId, null);
  };

  const settle = useDragSettle({ activeId, originPageX, originPageY, onSettled: hide });

  // Coluna sob o dedo, tanto quando o dedo anda quanto quando o quadro rola sozinho.
  useAnimatedReaction(
    () => {
      if (activeId.get() === null) return null;
      const { columnIds: ids, pitch: step, gap: space, gutter: inset } = board.layout.get();
      // Uma vaga a mais no fim: a coluna "Adicionar coluna".
      const index = columnIndexAt(
        fingerX.get() + board.scrollX.get() - inset,
        step,
        space,
        ids.length + 1,
      );
      return index === ids.length ? ADD_COLUMN_SLOT : (ids[index] ?? null);
    },
    (next) => {
      if (next === null || next === overColumnId.get()) return;
      // A vaga anterior era de outra coluna: a nova coluna escreve a dela logo em seguida.
      slotIndex.set(-1);
      overColumnId.set(next);
    },
  );

  const clear = () => {
    'worklet';
    activeId.set(null);
    fromColumnId.set(null);
    overColumnId.set(null);
    slotIndex.set(-1);
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
    settle.stop();
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
    beginScrollX.set(board.scrollX.get());
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
    return translationX.get() + board.scrollX.get() - beginScrollX.get();
  };

  const release = () => {
    'worklet';
    const from = fromColumnId.get();
    clear();
    if (from !== null) board.snapToColumn(from);
  };

  const releaseToNewColumn = () => {
    'worklet';
    const id = activeId.get();
    clear();
    if (id !== null) scheduleOnRN(onDropOnNewColumn, id);
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

    const { columnIds: ids, pitch: step } = board.layout.get();
    landingShift.set((ids.indexOf(to) - ids.indexOf(from)) * step);
    landingColumnId.set(to);
    landingId.set(id);
    clear();
    board.snapToColumn(to);
    scheduleOnRN(onMove, id, to, index);
    scheduleOnRN(onDrop);
  };

  // O cartão que acabou de chegar pega a posição atual do fantasma, em coordenadas da lista dele.
  const takeOver = (columnScrollY: number) => {
    'worklet';
    const top = startY.get() + translationY.get() - listOriginY.get() + columnScrollY;
    const left = translationX.get() - landingShift.get() + board.scrollX.get() - beginScrollX.get();
    landingId.set(null);
    landingColumnId.set(null);
    return { top, left };
  };

  const markVisible = useCallback((id: string) => visibleId.set(id), [visibleId]);

  return {
    boardScrollHandler,
    originRef,
    boardScrollRef: board.scrollRef,
    activeCardId,
    drag: {
      ...values,
      ...settle.state,
      reportHeight,
      boardViewportWidth: board.viewportWidth,
      boardContentWidth: board.contentWidth,
      begin,
      move,
      horizontalOffset,
      release,
      releaseToNewColumn,
      dropInOtherColumn,
      takeOver,
      markVisible,
      focusColumn: board.focusColumn,
    },
  };
}
