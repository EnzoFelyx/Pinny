import { useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { batchStack, duration } from '@/theme';

import { stackedIds } from '../../model/batchStack';
import type { BatchDrag, StackOrigin } from './boardDrag.types';

// O que a camada desenha da pilha (estado do React, só para o conteúdo dos cartões).
export interface BatchStackContent {
  // Os outros cartões à mostra embaixo do segurado, na ordem da pilha.
  ids: readonly string[];
  // Total do lote (o número da bolinha).
  total: number;
}

export interface BatchDragOptions {
  // Marcados na ordem do quadro.
  selectedIds: readonly string[];
  isReducedMotion: boolean;
  // A pilha começou (o JS passa a tratar o soltar como lote) ou acabou sem mover nada.
  onBegin: (heldId: string) => void;
  onEnd: () => void;
  // A pilha terminou de juntar (toque tátil).
  onGathered: () => void;
}

// Arraste em lote ("pilha", como no Fotos do iOS), todo em shared values: quem está na pilha, de
// onde cada um sai voando e o progresso do voo. O cartão segurado continua sendo o do arraste
// normal (useBoardDrag); a pilha só desenha os outros embaixo dele. Os outros marcados saem das
// colunas na UI thread (useSortableColumn lê liftedIds) e voltam ao cancelar (restoreToken).
export function useBatchDrag({
  selectedIds,
  isReducedMotion,
  onBegin,
  onEnd,
  onGathered,
}: BatchDragOptions): { batch: BatchDrag; stack: BatchStackContent | null } {
  const [stack, setStack] = useState<BatchStackContent | null>(null);
  // Marcados copiados para a UI thread (o gesto começa lá).
  const selection = useSharedValue<readonly string[]>([]);
  useEffect(() => {
    selection.set(selectedIds);
  }, [selectedIds, selection]);

  const heldId = useSharedValue<string | null>(null);
  const liftedIds = useSharedValue<readonly string[]>([]);
  const stackIds = useSharedValue<readonly string[]>([]);
  const stackCount = useSharedValue(0);
  const gatherFrom = useSharedValue<Record<string, StackOrigin>>({});
  const gather = useSharedValue(0);
  const stackOpacity = useSharedValue(0);
  const restoreToken = useSharedValue(0);
  const flightMs = isReducedMotion ? duration.fast : batchStack.gatherMs;

  const reset = () => {
    'worklet';
    // heldId fica até o próximo arraste: o segurado pode assentar na coluna de destino depois de a
    // pilha sumir, e ele assenta sem quique.
    liftedIds.set([]);
    stackIds.set([]);
    stackCount.set(0);
    gatherFrom.set({});
    gather.set(0);
    stackOpacity.set(0);
    scheduleOnRN(setStack, null);
  };

  // Segurou um cartão marcado com outros marcados: começa a pilha. Devolve false quando não há
  // lote (só ele marcado, ou ele não está marcado): aí é o arraste normal.
  const begin = (held: string) => {
    'worklet';
    const ids = selection.get();
    if (ids.length < 2 || !ids.includes(held)) {
      // Arraste de um cartão só: o quique normal volta a valer.
      heldId.set(null);
      return false;
    }
    // Um cancelamento ainda voando (arraste novo no meio): devolve os cartões às colunas antes.
    if (liftedIds.get().length > 0) restoreToken.set(restoreToken.get() + 1);
    const shown = stackedIds(held, ids, batchStack.maxVisible);
    heldId.set(held);
    gatherFrom.set({});
    stackIds.set(shown);
    stackCount.set(ids.length);
    liftedIds.set(ids.filter((id) => id !== held));
    stackOpacity.set(1);
    gather.set(0);
    gather.set(
      withTiming(1, { duration: flightMs }, (finished) => {
        if (finished) scheduleOnRN(onGathered);
      }),
    );
    scheduleOnRN(setStack, { ids: shown, total: ids.length });
    scheduleOnRN(onBegin, held);
    return true;
  };

  // Cada cartão da pilha avisa de onde sai (posição na camada, antes de sair da coluna).
  const reportOrigin = (id: string, origin: StackOrigin) => {
    'worklet';
    gatherFrom.set({ ...gatherFrom.get(), [id]: origin });
  };

  // Soltou numa vaga nova: o JS grava e redesenha as colunas (os cartões aparecem lá assim que a
  // ordem nova chega); a pilha some rápido por cima.
  const commit = () => {
    'worklet';
    if (stackCount.get() === 0) return;
    liftedIds.set([]);
    stackOpacity.set(
      withTiming(0, { duration: duration.fast }, (finished) => {
        if (finished) reset();
      }),
    );
  };

  // Soltou no mesmo lugar (ou sem destino): nada é gravado. Os cartões voltam voando e, ao
  // chegar, reaparecem nas colunas de origem.
  const cancel = () => {
    'worklet';
    if (stackCount.get() === 0) return;
    // As colunas abrem o espaço já (o segurado assenta no lugar certo); os cartões continuam
    // invisíveis (liftedIds) até as cópias chegarem.
    restoreToken.set(restoreToken.get() + 1);
    gather.set(
      withTiming(0, { duration: flightMs }, (finished) => {
        if (!finished) return;
        reset();
        scheduleOnRN(onEnd);
      }),
    );
  };

  return {
    stack,
    batch: {
      heldId,
      liftedIds,
      stackIds,
      stackCount,
      gatherFrom,
      gather,
      stackOpacity,
      restoreToken,
      begin,
      reportOrigin,
      commit,
      cancel,
    },
  };
}
