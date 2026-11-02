import { memo, useCallback } from 'react';
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
import { colors, DRAG_ACTIVATION_MS, duration, shadows } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { CardActions } from './boardActions';
import { ADD_COLUMN_SLOT } from './boardDrag.types';
import type { BoardDrag } from './useBoardDrag';
import { useCardAccessibilityActions } from './useCardAccessibilityActions';
import { useInListBounce } from './useInListBounce';
import type { SortableColumn } from './sortableColumn.types';

const CARD_RADIUS = 18;

interface SortableCardProps {
  card: BoardCardItem;
  columnId: string;
  columnIndex: number;
  columnCount: number;
  index: number;
  total: number;
  column: SortableColumn;
  drag: BoardDrag;
  // Desligado enquanto o título da coluna é editado.
  isDragEnabled: boolean;
  isReducedMotion: boolean;
  actions: CardActions;
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
  column,
  drag,
  isDragEnabled,
  isReducedMotion,
  actions,
}: SortableCardProps) {
  const { id } = card;
  // Começa em 0 e a reação abaixo posiciona o cartão já na montagem (sem ler shared value no render).
  const top = useSharedValue(0);
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;

  // Os outros cartões deslizam até a nova vaga quando a ordem muda.
  useAnimatedReaction(
    () => column.offsets.get()[id] ?? 0,
    (next, previous) => {
      if (next === previous || drag.activeId.get() === id) return;
      // Acabou de chegar de outra coluna: quem posiciona é a reação abaixo (assume do fantasma).
      if (drag.landingId.get() === id && drag.landingColumnId.get() === columnId) return;
      // Na montagem e antes de todos os cartões serem medidos, vai direto ao lugar (sem deslizar).
      const shouldSlide = previous !== null && column.isLaidOut.get();
      top.set(shouldSlide ? withTiming(next, { duration: reorderDuration }) : next);
    },
  );

  // Vai direto para a vaga (invisível) e o quique é desenhado pelo fantasma, por cima de tudo,
  // grudado na posição da vaga na lista (acompanha as rolagens).
  const settle = (from: { top: number; left: number }, target: number) => {
    'worklet';
    top.set(target);
    drag.settle(id, columnId, column.listRef, from, target, isReducedMotion);
  };

  const bounce = useInListBounce({ id, drag, top, isReducedMotion });

  // Solto em outra coluna: este cartão é o novo, nesta coluna, e assume de onde o fantasma parou.
  useAnimatedReaction(
    () => drag.landingId.get() === id && drag.landingColumnId.get() === columnId,
    (isLanding) => {
      if (!isLanding) return;
      settle(drag.takeOver(column.scrollY.get()), column.offsets.get()[id] ?? 0);
    },
  );

  const gesture = usePanGesture({
    enabled: isDragEnabled,
    activateAfterLongPress: DRAG_ACTIVATION_MS,
    onActivate: (event) => {
      'worklet';
      drag.begin(
        id,
        columnId,
        column.listRef,
        column.offsets.get()[id] ?? 0,
        column.scrollY.get(),
        event.absoluteX,
      );
      column.startDrag(id);
    },
    onUpdate: (event) => {
      'worklet';
      drag.move(event.translationX, event.translationY, event.absoluteX);
    },
    onDeactivate: () => {
      'worklet';
      const over = drag.overColumnId.get();
      if (over !== null && over !== columnId && drag.slotIndex.get() >= 0) {
        drag.dropInOtherColumn();
        return;
      }
      // Assume do mesmo ponto e jeito da cópia e assenta na vaga dentro da lista. Solto na coluna
      // "Adicionar coluna", volta para a vaga de antes e a folha "Nova coluna" abre com ele.
      const fromTop = column.dragTop.get();
      const fromLeft = drag.horizontalOffset();
      const target = column.endDrag();
      if (over === ADD_COLUMN_SLOT) drag.releaseToNewColumn();
      else drag.release();
      settle({ top: fromTop, left: fromLeft }, target);
    },
  });

  // Invisível enquanto o fantasma o representa (arraste e quique).
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: drag.visibleId.get() === id ? 0 : 1,
    zIndex: bounce.lift.get() > 0 ? 1 : 0,
    transform: [
      { translateX: bounce.left.get() },
      { translateY: top.get() },
      { rotate: `${interpolate(bounce.lift.get(), [0, 1], [0, bounce.rotation])}deg` },
      { scale: interpolate(bounce.lift.get(), [0, 1], [1, bounce.scale]) },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() => ({ opacity: bounce.lift.get() }));

  const measure = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      // modify roda na UI thread: vários cartões medindo ao mesmo tempo não apagam a medida um do outro.
      drag.heights.modify((current) => {
        'worklet';
        return current[id] === height ? current : { ...current, [id]: height };
      });
    },
    [drag.heights, id],
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
      <Animated.View onLayout={measure} style={[styles.card, animatedStyle]}>
        <Animated.View style={[styles.liftedShadow, shadowStyle]} />
        <Card
          title={card.title}
          accessibilityLabel={card.accessibilityLabel}
          labels={card.labels}
          priority={card.priority}
          deadline={card.deadline}
          checklistText={card.checklistText}
          accessibilityActions={accessibility.accessibilityActions}
          onAccessibilityAction={accessibility.onAccessibilityAction}
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
  // Sombra elevada numa camada própria, para sumir com fade no fim do quique.
  liftedShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.surface,
    boxShadow: shadows.lifted,
  },
});
