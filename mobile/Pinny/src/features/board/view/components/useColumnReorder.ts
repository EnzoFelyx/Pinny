import { useCallback } from 'react';
import type { View } from 'react-native';
import {
  type AnimatedRef,
  type SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { columnIndexAt } from '../../model/reorder';
import type { BoardLayout } from './useBoardScroll';
import type { ColumnDrag, ColumnDragRelease } from './useColumnDrag';

interface ColumnReorderOptions {
  columnDrag: ColumnDrag;
  releasing: ColumnDragRelease;
  layout: SharedValue<BoardLayout>;
  scrollX: SharedValue<number>;
  fingerX: SharedValue<number>;
  // Encaixa o quadro numa posição (a coluna verdadeira acompanha a rolagem sozinha).
  snapToIndex: (index: number) => number;
  // Coluna solta numa vaga nova (o JS grava a ordem).
  onMoveColumn: (columnId: string, toIndex: number) => void;
}

// Reordenar colunas na UI thread: a vaga é a coluna sob o dedo (com a rolagem do quadro, também
// quando ele rola sozinho). Ao soltar, a coluna verdadeira assume do ponto onde a cópia está e
// assenta no lugar, dentro do quadro (acompanha a rolagem e já pode ser rolada). Numa vaga nova, o
// JS grava a ordem na hora e a troca espera a nova ordem ser desenhada (markOrderCommitted).
export function useColumnReorder({
  columnDrag,
  releasing,
  layout,
  scrollX,
  fingerX,
  snapToIndex,
  onMoveColumn,
}: ColumnReorderOptions): Pick<ColumnDrag, 'begin' | 'end'> & {
  markOrderCommitted: () => void;
} {
  const { activeColumnId, isHolding, orderAtBegin, fromIndex, slotIndex } = columnDrag;
  const { translationX, translationY } = columnDrag;
  const beginScrollX = useSharedValue(0);
  // Coluna solta numa vaga nova, esperando a nova ordem ser desenhada.
  const pendingId = useSharedValue<string | null>(null);
  const pendingBase = useSharedValue(0);

  useAnimatedReaction(
    () => {
      const id = activeColumnId.get();
      if (id === null || !isHolding.get()) return null;
      const { columnIds, pitch, gap, gutter } = layout.get();
      return columnIndexAt(fingerX.get() + scrollX.get() - gutter, pitch, gap, columnIds.length);
    },
    (slot) => {
      if (slot !== null) slotIndex.set(slot);
    },
  );

  // base: deslocamento do lugar final em relação ao início do arraste, com a rolagem em zero.
  // O que falta para a coluna verdadeira chegar lá vem da posição atual da cópia.
  const handOffAt = (columnId: string, base: number) => {
    'worklet';
    releasing.handOff(columnId, translationX.get() - (base - scrollX.get()), translationY.get());
  };

  const begin = (columnId: string, frameRef: AnimatedRef<View>, absoluteX: number) => {
    'worklet';
    const ids = layout.get().columnIds;
    pendingId.set(null);
    orderAtBegin.set(ids);
    fromIndex.set(ids.indexOf(columnId));
    beginScrollX.set(scrollX.get());
    columnDrag.begin(columnId, frameRef, absoluteX);
  };

  const end = () => {
    'worklet';
    if (!isHolding.get()) return;
    releasing.release();
    const id = activeColumnId.get();
    const from = fromIndex.get();
    const slot = slotIndex.get();
    if (id === null) return;
    const isNewSlot = from >= 0 && slot >= 0 && slot !== from;
    const target = isNewSlot ? slot : Math.max(0, from);
    snapToIndex(target);
    const base = (target - from) * layout.get().pitch + beginScrollX.get();
    if (!isNewSlot) {
      handOffAt(id, base);
      return;
    }
    pendingId.set(id);
    pendingBase.set(base);
    scheduleOnRN(onMoveColumn, id, slot);
  };

  // Chamado pelo JS logo depois de a nova ordem ser desenhada.
  const markOrderCommitted = useCallback(() => {
    scheduleOnUI(() => {
      'worklet';
      const id = pendingId.get();
      if (id === null) return;
      pendingId.set(null);
      handOffAt(id, pendingBase.get());
    });
    // handOffAt só lê shared values e o objeto de soltar (estável).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingId, pendingBase]);

  return { begin, end, markOrderCommitted };
}
