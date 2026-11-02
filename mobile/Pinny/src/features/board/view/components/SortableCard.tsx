import { memo, useCallback, useMemo } from 'react';
import {
  AccessibilityInfo,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  StyleSheet,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { ptBR } from '@/i18n/pt-BR';
import { DRAG_ACTIVATION_MS, duration } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { BoardDrag } from './useBoardDrag';
import type { SortableColumn } from './useSortableColumn';

const text = ptBR.board;
const CARD_RADIUS = 18;

type MoveAction = 'moveUp' | 'moveDown' | 'moveToPreviousColumn' | 'moveToNextColumn' | 'moveTo';

const actionLabels: Record<MoveAction, string> = {
  moveUp: text.moveUp,
  moveDown: text.moveDown,
  moveToPreviousColumn: text.moveToPreviousColumn,
  moveToNextColumn: text.moveToNextColumn,
  moveTo: text.moveTo,
};

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
  onMove: (cardId: string, toColumnId: string, toIndex: number) => void;
  onMoveToAdjacentColumn: (cardId: string, step: -1 | 1) => string | null;
  onOpenMoveCard: (cardId: string) => void;
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
  onMove,
  onMoveToAdjacentColumn,
  onOpenMoveCard,
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
      // Assume do mesmo ponto e jeito da cópia e assenta na vaga dentro da lista.
      const fromTop = column.dragTop.get();
      const fromLeft = drag.horizontalOffset();
      const target = column.endDrag();
      drag.release();
      settle({ top: fromTop, left: fromLeft }, target);
    },
  });

  // Invisível enquanto o fantasma o representa (arraste e quique).
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: drag.visibleId.get() === id ? 0 : 1,
    transform: [{ translateY: top.get() }],
  }));

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

  // Alternativas sem gesto (CLAUDE.md, regra 15): mover uma vaga, mudar de coluna ou escolher
  // coluna e posição na folha "Mover para...". O leitor de tela anuncia o resultado.
  const accessibilityActions = useMemo(() => {
    const names: MoveAction[] = ['moveUp', 'moveDown'];
    if (columnIndex > 0) names.push('moveToPreviousColumn');
    if (columnIndex < columnCount - 1) names.push('moveToNextColumn');
    names.push('moveTo');
    return names.map((name) => ({ name, label: actionLabels[name] }));
  }, [columnIndex, columnCount]);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const action = event.nativeEvent.actionName;
      if (action === 'moveTo') {
        onOpenMoveCard(id);
        return;
      }
      if (action === 'moveToPreviousColumn' || action === 'moveToNextColumn') {
        const announcement = onMoveToAdjacentColumn(id, action === 'moveToNextColumn' ? 1 : -1);
        if (announcement) AccessibilityInfo.announceForAccessibility(announcement);
        return;
      }
      const target = index + (action === 'moveUp' ? -1 : 1);
      if (target < 0 || target >= total) return;
      onMove(id, columnId, target);
      AccessibilityInfo.announceForAccessibility(text.movedTo(target + 1, total));
    },
    [columnId, id, index, total, onMove, onMoveToAdjacentColumn, onOpenMoveCard],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View onLayout={measure} style={[styles.card, animatedStyle]}>
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
});
