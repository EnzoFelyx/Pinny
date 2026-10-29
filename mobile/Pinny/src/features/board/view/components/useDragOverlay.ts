import { useCallback, useState } from 'react';
import type { View } from 'react-native';
import {
  type AnimatedRef,
  measure,
  type SharedValue,
  useAnimatedRef,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { duration } from '@/theme';

export interface DragOverlay {
  // Qual cartão desenhar na camada (estado do React, só para o conteúdo).
  activeCardId: string | null;
  originRef: AnimatedRef<View>;
  x: SharedValue<number>;
  startY: SharedValue<number>;
  translationY: SharedValue<number>;
  width: SharedValue<number>;
  lift: SharedValue<number>;
  // Cartão cujo fantasma já está desenhado: o original na coluna fica invisível.
  visibleId: SharedValue<string | null>;
  begin: (id: string, listRef: AnimatedRef<View>, offset: number) => void;
  move: (translationY: number) => void;
  release: () => void;
  markVisible: (id: string) => void;
}

// Camada de arraste da tela do quadro: enquanto o dedo segura, o cartão é desenhado aqui, por
// cima de tudo (cabeçalho da coluna e bordas incluídos). O original continua na coluna,
// invisível, com o gesto e o cálculo das vagas.
export function useDragOverlay(): DragOverlay {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const originRef = useAnimatedRef<View>();
  const x = useSharedValue(0);
  const startY = useSharedValue(0);
  const translationY = useSharedValue(0);
  const width = useSharedValue(0);
  const lift = useSharedValue(0);
  const visibleId = useSharedValue<string | null>(null);

  // A posição vem da lista da coluna (sem transform) mais o topo do cartão nela.
  const begin = (id: string, listRef: AnimatedRef<View>, offset: number) => {
    'worklet';
    const list = measure(listRef);
    const origin = measure(originRef);
    if (!list || !origin) return;
    x.set(list.pageX - origin.pageX);
    startY.set(list.pageY - origin.pageY + offset);
    width.set(list.width);
    translationY.set(0);
    lift.set(withTiming(1, { duration: duration.fast }));
    scheduleOnRN(setActiveCardId, id);
  };

  const move = (nextTranslationY: number) => {
    'worklet';
    translationY.set(nextTranslationY);
  };

  // Ao soltar, o fantasma some e o cartão da lista assume dali (o quique acontece na própria
  // lista, acompanhando qualquer rolagem). Os dois estão no mesmo ponto da tela nesse instante.
  const release = () => {
    'worklet';
    visibleId.set(null);
    lift.set(0);
    scheduleOnRN(setActiveCardId, null);
  };

  const markVisible = useCallback((id: string) => visibleId.set(id), [visibleId]);

  return {
    activeCardId,
    originRef,
    x,
    startY,
    translationY,
    width,
    lift,
    visibleId,
    begin,
    move,
    release,
    markVisible,
  };
}
