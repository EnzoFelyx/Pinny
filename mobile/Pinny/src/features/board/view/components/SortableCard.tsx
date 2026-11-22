import { memo, useCallback, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { ptBR } from '@/i18n/pt-BR';
import { colors, DRAG_ACTIVATION_MS, duration, shadows } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { CardActions } from './boardActions';
import { ADD_COLUMN_SLOT } from './boardDrag.types';
import type { BoardDrag } from './useBoardDrag';
import { CardSelectionBackground, CardSelectionCheck } from './CardSelectionLayers';
import { useBatchOrigin } from './useBatchOrigin';
import { useCardAccessibilityActions } from './useCardAccessibilityActions';
import { useInListBounce } from './useInListBounce';
import type { SortableColumn } from './sortableColumn.types';
import type { SelectionValues } from './useSelectionValues';

const CARD_RADIUS = 18;
const openHint = ptBR.card.openHint;

interface SortableCardProps {
  card: BoardCardItem;
  columnId: string;
  columnIndex: number;
  columnCount: number;
  // Posição entre os cartões visíveis (-1 = escondido pelo filtro).
  index: number;
  total: number;
  // Escondido pelo filtro: continua montado, sem aparecer nem ocupar espaço.
  isHidden: boolean;
  column: SortableColumn;
  drag: BoardDrag;
  // Desligado enquanto o título da coluna é editado.
  isDragEnabled: boolean;
  isReducedMotion: boolean;
  actions: CardActions;
  // Modo de seleção na UI thread: o visual e o arraste (só os marcados arrastam) leem daqui, sem
  // redesenhar o cartão. O toque marca/desmarca (fora do modo, não faz nada).
  selection: SelectionValues;
  // Só com o leitor de tela ligado: marcado ou não, para ele ler o cartão como caixa de seleção
  // (undefined = fora do modo).
  accessibilitySelected?: boolean;
}

// Cartão do quadro: segurar e arrastar muda a ordem ou a coluna. Enquanto o dedo segura e
// durante o quique ao soltar, quem aparece é a cópia na camada de arraste, por cima de tudo; no
// quique, ela acompanha a posição da vaga na lista a cada quadro (rolagens incluídas). Este cartão
// fica invisível já no lugar final e reaparece quando o quique termina. Tudo na UI thread.
export const SortableCard = memo(function SortableCard({
  card,
  columnId,
  columnIndex,
  columnCount,
  index,
  total,
  isHidden,
  column,
  drag,
  isDragEnabled,
  isReducedMotion,
  actions,
  selection,
  accessibilitySelected,
}: SortableCardProps) {
  const { id } = card;
  // Só os valores que cada animação lê: um worklet que captura o objeto `drag` ou `column` inteiro
  // depende de todos os shared values dele e rodaria de novo a cada quadro do arraste, em todos
  // os cartões do quadro.
  const { activeId, landingId, landingColumnId, visibleId, settleId, batch } = drag;
  const { offsets } = column;
  // Começa em 0 e a reação abaixo posiciona o cartão já na montagem (sem ler shared value no render).
  const top = useSharedValue(0);
  // Fora da ordem da coluna sem ser pelo filtro (levantado para a pilha, ou ainda chegando):
  // não aparece no lugar antigo.
  const isOutOfOrder = useSharedValue(false);
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;

  // Os outros cartões deslizam até a nova vaga quando a ordem muda.
  useAnimatedReaction(
    // null = fora da ordem da coluna (escondido pelo filtro).
    () => offsets.get()[id] ?? null,
    (next, previous) => {
      isOutOfOrder.set(next === null);
      if (next === previous || activeId.get() === id) return;
      // A vaga mudou ou sumiu no meio do quique (ex.: troca de filtro): o quique acaba na hora.
      // Escondido, o cartão some; senão, vai direto ao lugar novo (o fantasma iria ao antigo).
      // A vaga igual ao destino do quique (top já está nele) é o próprio soltar, não uma troca.
      const isSettling =
        settleId.get() === id && previous !== null && previous !== undefined && next !== top.get();
      if (isSettling) drag.cancelSettle(id);
      if (next === null) return;
      if (isSettling) {
        top.set(next);
        return;
      }
      // Acabou de chegar de outra coluna: quem posiciona é a reação abaixo (assume do fantasma).
      if (landingId.get() === id && landingColumnId.get() === columnId) return;
      // Na montagem, ao voltar de escondido e antes de todos os cartões serem medidos, vai direto
      // ao lugar (sem deslizar).
      const shouldSlide = previous !== null && previous !== undefined && column.isLaidOut.get();
      top.set(shouldSlide ? withTiming(next, { duration: reorderDuration }) : next);
    },
  );

  // Vai direto para a vaga (invisível) e o quique é desenhado pelo fantasma, por cima de tudo,
  // grudado na posição da vaga na lista (acompanha as rolagens).
  // Com a pilha (arraste em lote), o segurado só desliza até a vaga, sem quique (pedido do autor):
  // o quique deixava a cópia por cima por mais tempo.
  const { heldId: batchHeldId } = batch;
  const settle = (from: { top: number; left: number }, target: number) => {
    'worklet';
    top.set(target);
    const isBatchHeld = batchHeldId.get() === id;
    drag.settle(id, columnId, column.listRef, from, target, isReducedMotion || isBatchHeld);
  };

  // Arraste em lote: se este cartão vai para a pilha, avisa de onde sai voando (antes de sair da
  // coluna). Escondido pelo filtro, não tem de onde voar: aparece na pilha com fade.
  useBatchOrigin({ id, isHidden, batch, drag, column, top });

  const bounce = useInListBounce({ id, drag, top, isReducedMotion });
  const { left: bounceLeft, lift: bounceLift, rotation, scale } = bounce;

  // Solto em outra coluna: este cartão é o novo, nesta coluna, e assume de onde o fantasma parou.
  useAnimatedReaction(
    () => landingId.get() === id && landingColumnId.get() === columnId,
    (isLanding) => {
      if (!isLanding) return;
      settle(drag.takeOver(column.scrollY.get()), offsets.get()[id] ?? 0);
    },
  );

  // Selecionando, só os marcados arrastam (e levam os outros juntos, na pilha). Decidido na UI
  // thread ao ativar, não pelo `enabled`: um shared value no `enabled` faz o RNGH reconfigurar o
  // handler nativo de cada cartão a cada mudança (400 chamadas ao entrar e sair do modo), e uma
  // prop boolean redesenharia todos os cartões. Segurar um cartão não marcado só não faz nada.
  const { marked } = selection;
  const isDragging = useSharedValue(false);
  const gesture = usePanGesture({
    enabled: isDragEnabled,
    activateAfterLongPress: DRAG_ACTIVATION_MS,
    onActivate: (event) => {
      'worklet';
      const map = marked.get();
      if (map !== null && map[id] !== true) return;
      isDragging.set(true);
      drag.begin(
        id,
        columnId,
        column.listRef,
        column.offsets.get()[id] ?? 0,
        column.scrollY.get(),
        event.absoluteX,
      );
      column.startDrag(id);
      // Marcado com outros marcados: os outros voam para baixo dele (pilha).
      batch.begin(id);
    },
    onUpdate: (event) => {
      'worklet';
      if (!isDragging.get()) return;
      drag.move(event.translationX, event.translationY, event.absoluteX);
    },
    onDeactivate: () => {
      'worklet';
      if (!isDragging.get()) return;
      isDragging.set(false);
      const over = drag.overColumnId.get();
      const isBatch = batch.stackCount.get() > 1;
      if (over !== null && over !== columnId && over !== ADD_COLUMN_SLOT) {
        if (drag.slotIndex.get() >= 0) {
          drag.dropInOtherColumn();
          if (isBatch) batch.commit();
          return;
        }
      }
      // Pilha solta na própria coluna do segurado (em qualquer vaga) ou sem destino: cancela
      // (decisão do autor). Na "Adicionar coluna", também volta tudo ao lugar e a folha "Nova
      // coluna" abre com todos os marcados. A coluna volta à ordem de antes já, para o segurado
      // assentar no lugar de onde saiu.
      const isBatchCancel = isBatch;
      if (isBatchCancel) column.restoreOrder();
      // Assume do mesmo ponto e jeito da cópia e assenta na vaga dentro da lista. Solto na coluna
      // "Adicionar coluna", volta para a vaga de antes e a folha "Nova coluna" abre com ele.
      const fromTop = column.dragTop.get();
      const fromLeft = drag.horizontalOffset();
      const target = column.endDrag();
      if (over === ADD_COLUMN_SLOT) drag.releaseToNewColumn();
      else drag.release();
      settle({ top: fromTop, left: fromLeft }, target);
      if (isBatchCancel) batch.cancel();
    },
  });

  // Invisível enquanto o fantasma o representa (arraste e quique).
  const { liftedIds } = batch;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibleId.get() === id || isOutOfOrder.get() || liftedIds.get().includes(id) ? 0 : 1,
    zIndex: bounceLift.get() > 0 ? 1 : 0,
    transform: [
      { translateX: bounceLeft.get() },
      { translateY: top.get() },
      { rotate: `${interpolate(bounceLift.get(), [0, 1], [0, rotation])}deg` },
      { scale: interpolate(bounceLift.get(), [0, 1], [1, scale]) },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() => ({ opacity: bounceLift.get() }));

  const { reportHeight } = drag;
  const measure = (event: LayoutChangeEvent) => {
    reportHeight(id, event.nativeEvent.layout.height);
  };

  const { press } = actions;
  const pressHere = useCallback(() => press(id), [press, id]);
  const selectionBackground = useMemo(
    () => <CardSelectionBackground id={id} selection={selection} />,
    [id, selection],
  );
  const selectionCheck = useMemo(
    () => <CardSelectionCheck id={id} selection={selection} />,
    [id, selection],
  );

  const accessibility = useCardAccessibilityActions({
    cardId: id,
    columnId,
    columnIndex,
    columnCount,
    index,
    total,
    actions,
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={measure}
        style={[styles.card, animatedStyle, isHidden ? styles.hidden : null]}
      >
        <Animated.View style={[styles.liftedShadow, shadowStyle]} />
        <Card
          title={card.title}
          titleParts={card.titleParts}
          accessibilityLabel={card.accessibilityLabel}
          labels={card.labels}
          priority={card.priority}
          deadline={card.deadline}
          checklistText={card.checklistText}
          thumbnail={card.thumbnail}
          accessibilityActions={accessibility.accessibilityActions}
          onAccessibilityAction={accessibility.onAccessibilityAction}
          accessibilitySelected={accessibilitySelected}
          background={selectionBackground}
          overlay={selectionCheck}
          onPress={pressHere}
          accessibilityHint={accessibilitySelected === undefined ? openHint : undefined}
        />
      </Animated.View>
    </GestureDetector>
  );
});

// Posição absoluta: o topo vem do translateY animado (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: CARD_RADIUS,
  },
  hidden: { display: 'none' },
  // Sombra elevada numa camada própria, para sumir com fade no fim do quique.
  liftedShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.surface,
    boxShadow: shadows.lifted,
  },
});
