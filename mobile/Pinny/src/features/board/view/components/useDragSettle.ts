import type { View } from 'react-native';
import {
  type AnimatedRef,
  measure,
  type SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { dragSpring, duration } from '@/theme';

interface DragSettleOptions {
  // Cartão segurado agora (um arraste novo no meio do quique tem prioridade).
  activeId: SharedValue<string | null>;
  // Posição da camada do fantasma na tela (origem das medidas).
  originPageX: SharedValue<number>;
  originPageY: SharedValue<number>;
  // Some com o fantasma e mostra o cartão da lista.
  onSettled: () => void;
}

// Quique ao soltar, desenhado pelo fantasma (por cima de tudo, sem corte do cabeçalho nem das
// bordas da coluna) na posição da vaga dentro da lista. A coluna mede a lista a cada quadro
// (trackSettle), então o quique acompanha qualquer rolagem.
export function useDragSettle({
  activeId,
  originPageX,
  originPageY,
  onSettled,
}: DragSettleOptions) {
  const settleId = useSharedValue<string | null>(null);
  const settleColumnId = useSharedValue<string | null>(null);
  const settleTop = useSharedValue(0);
  const settleLeft = useSharedValue(0);
  const settleLift = useSharedValue(0);
  const settleListX = useSharedValue(0);
  const settleListY = useSharedValue(0);
  // Cartão cujo quique passou para dentro da lista (a coluna começou a rolar no meio dele).
  const handoffId = useSharedValue<string | null>(null);

  // Encerra o quique (ex.: outro arraste começou): o cartão volta a aparecer na lista.
  const stop = () => {
    'worklet';
    settleId.set(null);
    settleColumnId.set(null);
    handoffId.set(null);
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
      stop();
      onSettled();
      return;
    }
    // Ao parar, o cartão da lista (já na vaga) reaparece e o fantasma some, se outro arraste não
    // tiver começado no meio.
    const finish = () => {
      'worklet';
      if (settleId.get() !== id || activeId.get() !== null) return;
      stop();
      onSettled();
    };
    settleTop.set(from.top);
    settleLeft.set(from.left);
    settleLift.set(1);
    if (isReducedMotion) {
      settleTop.set(withTiming(target, { duration: duration.fast }, finish));
      settleLeft.set(withTiming(0, { duration: duration.fast }));
    } else {
      settleTop.set(withSpring(target, dragSpring, finish));
      settleLeft.set(withSpring(0, dragSpring));
    }
    settleLift.set(withTiming(0, { duration: duration.normal }));
  };

  const trackSettle = (listRef: AnimatedRef<View>) => {
    'worklet';
    placeSettle(listRef);
  };

  // A coluna começou a rolar no meio do quique: o fantasma, por cima de tudo, subiria junto com a
  // lista para fora da coluna. O cartão da lista assume do ponto atual (ver SortableCard) e
  // termina o quique lá dentro, onde a coluna o corta normalmente.
  // O fantasma continua no lugar do quique até o cartão assumir (sem piscar na posição do arraste).
  const handOff = () => {
    'worklet';
    const id = settleId.get();
    if (id === null || handoffId.get() !== null) return;
    handoffId.set(id);
  };

  // A vaga do cartão mudou (ou sumiu) no meio do quique, ex.: o filtro foi trocado. O fantasma
  // iria até a posição antiga: o quique acaba na hora e o cartão da lista aparece no lugar certo
  // (ou continua escondido, se o filtro o esconde).
  const cancel = (id: string) => {
    'worklet';
    if (settleId.get() !== id) return;
    stop();
    onSettled();
  };

  // O cartão da lista já pegou a posição: o quique do fantasma acaba e ele some.
  const finishHandoff = () => {
    'worklet';
    handoffId.set(null);
    stop();
    onSettled();
  };

  return {
    // O que entra no objeto do arraste (BoardDrag).
    state: {
      settleId,
      settleColumnId,
      settleTop,
      settleLeft,
      settleLift,
      settleListX,
      settleListY,
      settle,
      trackSettle,
      handoffId,
      handOff,
      finishHandoff,
      cancelSettle: cancel,
    },
    stop,
  };
}
