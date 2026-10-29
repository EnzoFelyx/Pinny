import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

import { ESTIMATED_CARD_HEIGHT, type SortableColumn } from './useSortableColumn';

interface DropPlaceholderProps {
  column: SortableColumn;
  reorderDuration: number;
}

const RADIUS = 18;
const BORDER_WIDTH = 2;

// Vaga tracejada onde o cartão arrastado vai cair (Figma: "Espaço de origem"). Decorativa:
// o leitor de tela usa as ações "Mover para cima/baixo" do cartão.
export function DropPlaceholder({ column, reorderDuration }: DropPlaceholderProps) {
  const top = useSharedValue(0);

  // Ao levantar o cartão, aparece direto na vaga dele; nas trocas seguintes, desliza junto com os vizinhos.
  useAnimatedReaction(
    () => {
      const id = column.activeId.get();
      return id === null ? null : { id, offset: column.offsets.get()[id] ?? 0 };
    },
    (next, previous) => {
      if (next === null) return;
      top.set(
        previous?.id === next.id
          ? withTiming(next.offset, { duration: reorderDuration })
          : next.offset,
      );
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    const id = column.activeId.get();
    return {
      opacity: id === null ? 0 : 1,
      height: id === null ? 0 : (column.heights.get()[id] ?? ESTIMATED_CARD_HEIGHT),
      transform: [{ translateY: top.get() }],
    };
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.placeholder, animatedStyle]}
    />
  );
}

// Borda tracejada e posição animada: StyleSheet (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: RADIUS,
    borderWidth: BORDER_WIDTH,
    borderStyle: 'dashed',
    borderColor: colors.dropZoneBorder,
    backgroundColor: colors.dropZoneBackground,
  },
});
