import { memo, useCallback } from 'react';
import {
  AccessibilityInfo,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  StyleSheet,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { ptBR } from '@/i18n/pt-BR';
import { colors, DRAG_ACTIVATION_MS, dragLift, dragSpring, duration, shadows } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { DragOverlay } from './useDragOverlay';
import type { SortableColumn } from './useSortableColumn';

const text = ptBR.board;
const CARD_RADIUS = 18;

const accessibilityActions = [
  { name: 'moveUp', label: text.moveUp },
  { name: 'moveDown', label: text.moveDown },
] as const;

interface SortableCardProps {
  card: BoardCardItem;
  columnId: string;
  index: number;
  total: number;
  column: SortableColumn;
  overlay: DragOverlay;
  isReducedMotion: boolean;
  onMove: (columnId: string, cardId: string, toIndex: number) => void;
}

// Cartão do quadro: segurar e arrastar muda a ordem. Enquanto o dedo segura, quem aparece é a
// cópia na camada de arraste (por cima de tudo). Ao soltar, este cartão assume no mesmo ponto,
// ainda girado e elevado, e assenta na vaga com a mola dentro da própria lista: assim o quique
// acompanha a rolagem. Tudo animado na UI thread.
export const SortableCard = memo(function SortableCard({
  card,
  columnId,
  index,
  total,
  column,
  overlay,
  isReducedMotion,
  onMove,
}: SortableCardProps) {
  const { id } = card;
  // Começa em 0 e a reação abaixo posiciona o cartão já na montagem (sem ler shared value no render).
  const top = useSharedValue(0);
  // 1 = girado, maior e elevado (Figma "Quadro · Arrastar cartão"); usado só ao assentar.
  const lift = useSharedValue(0);
  const rotation = isReducedMotion ? 0 : dragLift.rotationDeg;
  const scale = isReducedMotion ? 1 : dragLift.scale;
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;

  // Os outros cartões deslizam até a nova vaga quando a ordem muda.
  useAnimatedReaction(
    () => column.offsets.get()[id] ?? 0,
    (next, previous) => {
      if (next === previous || column.activeId.get() === id) return;
      // Na montagem e antes de todos os cartões serem medidos, vai direto ao lugar (sem deslizar).
      const shouldSlide = previous !== null && column.isLaidOut.get();
      top.set(shouldSlide ? withTiming(next, { duration: reorderDuration }) : next);
    },
  );

  const gesture = usePanGesture({
    activateAfterLongPress: DRAG_ACTIVATION_MS,
    onActivate: () => {
      'worklet';
      overlay.begin(id, column.listRef, column.offsets.get()[id] ?? 0);
      column.startDrag(id);
    },
    onUpdate: (event) => {
      'worklet';
      overlay.move(event.translationY);
      column.updateDrag(event.translationY);
    },
    onDeactivate: () => {
      'worklet';
      const from = column.dragTop.get();
      const target = column.endDrag();
      overlay.release();
      // Assume do mesmo ponto e jeito da cópia e assenta na vaga dentro da lista.
      top.set(from);
      top.set(
        isReducedMotion
          ? withTiming(target, { duration: duration.fast })
          : withSpring(target, dragSpring),
      );
      lift.set(1);
      lift.set(withTiming(0, { duration: duration.normal }));
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: overlay.visibleId.get() === id ? 0 : 1,
    zIndex: lift.get() > 0 ? 1 : 0,
    transform: [
      { translateY: top.get() },
      { rotate: `${interpolate(lift.get(), [0, 1], [0, rotation])}deg` },
      { scale: interpolate(lift.get(), [0, 1], [1, scale]) },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({ opacity: lift.get() }));

  const measure = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      // modify roda na UI thread: vários cartões medindo ao mesmo tempo não apagam a medida um do outro.
      column.heights.modify((current) => {
        'worklet';
        return current[id] === height ? current : { ...current, [id]: height };
      });
    },
    [column.heights, id],
  );

  // Alternativa sem gesto (CLAUDE.md, regra 15): mover uma vaga e anunciar a nova posição.
  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const step = event.nativeEvent.actionName === 'moveUp' ? -1 : 1;
      const target = index + step;
      if (target < 0 || target >= total) return;
      onMove(columnId, id, target);
      AccessibilityInfo.announceForAccessibility(text.movedTo(target + 1, total));
    },
    [columnId, id, index, total, onMove],
  );

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
          accessibilityActions={accessibilityActions}
          onAccessibilityAction={handleAccessibilityAction}
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
  // Sombra elevada numa camada própria, para sumir com fade ao assentar.
  liftedShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.surface,
    boxShadow: shadows.lifted,
  },
});
