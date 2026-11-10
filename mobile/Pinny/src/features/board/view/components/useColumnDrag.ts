import { useState } from 'react';
import type { View } from 'react-native';
import {
  type AnimatedRef,
  measure,
  type SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { columnLift, duration } from '@/theme';

function noop() {}

// Arraste de coluna no nível do quadro, na UI thread: a cópia da coluna segurada é desenhada na
// camada por cima de tudo (ColumnDragOverlay) e segue o dedo nos dois eixos; a original fica
// invisível no lugar. Ao soltar, a cópia some e a coluna verdadeira assume do mesmo ponto e
// assenta no lugar (handoff), já podendo rolar e receber toques.
export interface ColumnDrag {
  // Coluna escondida no quadro (a cópia está na camada).
  activeColumnId: SharedValue<string | null>;
  // Dedo segurando: liga a rolagem automática do quadro e a animação das vagas.
  isHolding: SharedValue<boolean>;
  // Posição inicial da cópia na camada mais o deslocamento do dedo.
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
  // Altura da parte visível da coluna segurada: a vaga tracejada tem esse tamanho.
  height: SharedValue<number>;
  // Ordem das colunas ao segurar, posição de origem e vaga sob o dedo (-1 = sem vaga), escritas
  // por useColumnReorder.
  orderAtBegin: SharedValue<string[]>;
  fromIndex: SharedValue<number>;
  slotIndex: SharedValue<number>;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  // 0 = parada, 1 = levantada (giro, borda e sombra).
  lift: SharedValue<number>;
  // Coluna verdadeira assentando depois de soltar: deslocamento e giro que vão a zero.
  handoffColumnId: SharedValue<string | null>;
  handoffX: SharedValue<number>;
  handoffY: SharedValue<number>;
  handoffLift: SharedValue<number>;
  begin: (columnId: string, frameRef: AnimatedRef<View>, absoluteX: number) => void;
  move: (translationX: number, translationY: number, absoluteX: number) => void;
  // Dedo soltou: decide a vaga e quando a coluna verdadeira assume (useColumnReorder).
  end: () => void;
}

// O arraste de coluna como a tela recebe: com a rolagem do quadro.
export type BoardColumnDrag = ColumnDrag & { scrollX: SharedValue<number> };

// Partes usadas por useColumnReorder ao soltar.
export interface ColumnDragRelease {
  // Para de seguir o dedo (a cópia fica onde foi solta até a coluna verdadeira assumir).
  release: () => void;
  // A coluna verdadeira assume a partir do deslocamento dado (em relação ao lugar dela) e
  // assenta; a cópia some.
  handOff: (columnId: string, offsetX: number, offsetY: number) => void;
}

interface ColumnDragOptions {
  // Camada da cópia (origem das medidas), a mesma do arraste de cartão.
  originRef: AnimatedRef<View>;
  // Dedo na camada: a rolagem automática do quadro lê daqui.
  fingerX: SharedValue<number>;
  isReducedMotion: boolean;
}

export function useColumnDrag({ originRef, fingerX, isReducedMotion }: ColumnDragOptions): {
  columnDrag: ColumnDrag;
  releasing: ColumnDragRelease;
  // Qual coluna desenhar na camada (estado do React, só para o conteúdo).
  draggedColumnId: string | null;
} {
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const activeColumnId = useSharedValue<string | null>(null);
  const isHolding = useSharedValue(false);
  const originX = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const orderAtBegin = useSharedValue<string[]>([]);
  const fromIndex = useSharedValue(-1);
  const slotIndex = useSharedValue(-1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const lift = useSharedValue(0);
  const handoffColumnId = useSharedValue<string | null>(null);
  const handoffX = useSharedValue(0);
  const handoffY = useSharedValue(0);
  const handoffLift = useSharedValue(0);

  const settle = (onDone?: () => void) => {
    'worklet';
    const done = (finished?: boolean) => {
      'worklet';
      if (finished && onDone) onDone();
    };
    return isReducedMotion
      ? withTiming(0, { duration: duration.fast }, done)
      : withSpring(0, columnLift.spring, done);
  };

  const begin = (columnId: string, frameRef: AnimatedRef<View>, absoluteX: number) => {
    'worklet';
    const frame = measure(frameRef);
    const origin = measure(originRef);
    if (!frame || !origin) return;
    originX.set(origin.pageX);
    x.set(frame.pageX - origin.pageX);
    y.set(frame.pageY - origin.pageY);
    width.set(frame.width);
    height.set(frame.height);
    translationX.set(0);
    translationY.set(0);
    fingerX.set(absoluteX - origin.pageX);
    isHolding.set(true);
    activeColumnId.set(columnId);
    lift.set(
      isReducedMotion
        ? withTiming(1, { duration: duration.fast })
        : withSpring(1, columnLift.spring),
    );
    scheduleOnRN(setDraggedColumnId, columnId);
  };

  const move = (nextTranslationX: number, nextTranslationY: number, absoluteX: number) => {
    'worklet';
    translationX.set(nextTranslationX);
    translationY.set(nextTranslationY);
    fingerX.set(absoluteX - originX.get());
  };

  const release = () => {
    'worklet';
    isHolding.set(false);
  };

  const handOff = (columnId: string, offsetX: number, offsetY: number) => {
    'worklet';
    handoffX.set(offsetX);
    handoffY.set(offsetY);
    handoffLift.set(lift.get());
    handoffColumnId.set(columnId);
    // A cópia some e a verdadeira reaparece no mesmo ponto, já interativa.
    activeColumnId.set(null);
    fromIndex.set(-1);
    slotIndex.set(-1);
    lift.set(0);
    scheduleOnRN(setDraggedColumnId, null);
    handoffLift.set(settle());
    handoffY.set(settle());
    handoffX.set(
      settle(() => {
        'worklet';
        if (handoffColumnId.get() === columnId) handoffColumnId.set(null);
      }),
    );
  };

  return {
    draggedColumnId,
    releasing: { release, handOff },
    columnDrag: {
      activeColumnId,
      isHolding,
      x,
      y,
      width,
      height,
      orderAtBegin,
      fromIndex,
      slotIndex,
      translationX,
      translationY,
      lift,
      handoffColumnId,
      handoffX,
      handoffY,
      handoffLift,
      begin,
      move,
      // Trocado por useColumnReorder (precisa da rolagem do quadro).
      end: noop,
    },
  };
}
