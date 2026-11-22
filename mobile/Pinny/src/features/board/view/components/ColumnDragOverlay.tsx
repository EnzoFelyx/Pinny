import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { ColumnHeader } from '@/components/Column';
import { colors, columnLift, shadows } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { CARD_GAP } from './sortableColumn.types';
import type { ColumnDrag } from './useColumnDrag';

const COLUMN_RADIUS = 24;
// Borda da coluna levantada (Figma "Quadro · Reordenar colunas": 2).
const OUTLINE_WIDTH = 2;

function noop() {}

interface ColumnDragOverlayProps {
  columnDrag: ColumnDrag;
  column: BoardColumnItem | null;
  isReducedMotion: boolean;
}

// Camada por cima de tudo com a coluna segurada (Figma "Quadro · Reordenar colunas"): o cabeçalho
// e só os primeiros cartões, girada, com borda primary e sombra elevada. Só visual: o leitor de
// tela não a vê.
export function ColumnDragOverlay({ columnDrag, column, isReducedMotion }: ColumnDragOverlayProps) {
  const rotation = isReducedMotion ? 0 : columnLift.rotationDeg;
  const { x, y, width, translationX, translationY, lift } = columnDrag;

  // Segue o dedo. Ao soltar, some assim que a coluna verdadeira assume (ela é que assenta).
  const columnStyle = useAnimatedStyle(() => ({
    width: width.get(),
    transform: [
      { translateX: x.get() + translationX.get() },
      { translateY: y.get() + translationY.get() },
      { rotate: `${interpolate(lift.get(), [0, 1], [0, rotation])}deg` },
    ],
  }));
  const outlineStyle = useAnimatedStyle(() => ({ opacity: lift.get() }));

  if (!column) return null;
  const cards = column.visibleCards.slice(0, columnLift.visibleCards);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Animated.View style={[styles.column, columnStyle]}>
        <Animated.View style={[styles.shadow, outlineStyle]} />
        <View className="rounded-[24px] bg-column-background px-4 pb-4">
          <ColumnHeader
            title={column.title}
            cardCount={column.visibleCards.length}
            onRename={noop}
          />
          <View style={styles.cards}>
            {cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                titleParts={card.titleParts}
                accessibilityLabel={card.accessibilityLabel}
                labels={card.labels}
                priority={card.priority}
                deadline={card.deadline}
                checklistText={card.checklistText}
                thumbnail={card.thumbnail}
              />
            ))}
          </View>
        </View>
        <Animated.View style={[styles.outline, outlineStyle]} />
      </Animated.View>
    </View>
  );
}

// Posição e giro vêm do arraste, em tempo de execução (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  column: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: COLUMN_RADIUS,
  },
  cards: { gap: CARD_GAP },
  shadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: COLUMN_RADIUS,
    backgroundColor: colors.columnBackground,
    boxShadow: shadows.lifted,
  },
  outline: {
    ...StyleSheet.absoluteFill,
    borderRadius: COLUMN_RADIUS,
    borderWidth: OUTLINE_WIDTH,
    borderColor: colors.primary,
  },
});
