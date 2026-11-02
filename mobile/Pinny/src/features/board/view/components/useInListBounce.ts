import {
  type SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { dragLift, dragSpring, duration } from '@/theme';

import type { BoardDrag } from './boardDrag.types';

interface InListBounceOptions {
  id: string;
  drag: BoardDrag;
  // Topo do cartão na lista (já na vaga final durante o quique do fantasma).
  top: SharedValue<number>;
  isReducedMotion: boolean;
}

// A coluna rolou no meio do quique: o cartão da lista assume do ponto do fantasma (posição, giro e
// elevação) e termina o quique dentro da lista, acompanhando a rolagem e cortado pela coluna.
// Devolve os valores que o estilo do cartão usa (left e lift ficam em 0 fora desse caso).
export function useInListBounce({ id, drag, top, isReducedMotion }: InListBounceOptions) {
  const left = useSharedValue(0);
  // 1 = girado, maior e elevado, como o fantasma.
  const lift = useSharedValue(0);
  // Só o handoffId entra na reação (capturar `drag` inteiro a faria rodar a cada quadro).
  const { handoffId } = drag;

  useAnimatedReaction(
    () => handoffId.get() === id,
    (isHandoff) => {
      if (!isHandoff) return;
      const target = top.get();
      top.set(drag.settleTop.get());
      left.set(drag.settleLeft.get());
      lift.set(drag.settleLift.get());
      if (isReducedMotion) {
        top.set(withTiming(target, { duration: duration.fast }));
        left.set(withTiming(0, { duration: duration.fast }));
      } else {
        top.set(withSpring(target, dragSpring));
        left.set(withSpring(0, dragSpring));
      }
      lift.set(withTiming(0, { duration: duration.normal }));
      drag.finishHandoff();
    },
  );

  return {
    left,
    lift,
    rotation: isReducedMotion ? 0 : dragLift.rotationDeg,
    scale: isReducedMotion ? 1 : dragLift.scale,
  };
}
