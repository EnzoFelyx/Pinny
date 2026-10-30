import { StyleSheet, Text } from 'react-native';
import Animated, {
  type DerivedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import type { BoardDrag } from './useBoardDrag';
import { ESTIMATED_CARD_HEIGHT, type SortableColumn } from './useSortableColumn';

interface DropPlaceholderProps {
  columnId: string;
  column: SortableColumn;
  drag: BoardDrag;
  reorderDuration: number;
  // Altura fixa da vaga (coluna vazia: o espaço do estado vazio). 0 = altura do cartão.
  fixedHeight: DerivedValue<number>;
}

const RADIUS = 18;
const BORDER_WIDTH = 2;

// Vaga tracejada onde o cartão arrastado vai cair, sempre com "Solte para reorganizar". Na coluna
// de onde ele saiu, só a borda; nas outras, preenchida (destino). Decorativa: o leitor de tela usa
// as ações de mover do cartão.
export function DropPlaceholder({
  columnId,
  column,
  drag,
  reorderDuration,
  fixedHeight,
}: DropPlaceholderProps) {
  const top = useSharedValue(0);
  // Cartão arrastado que está na ordem desta coluna (null = a vaga não é aqui).
  const slotId = useDerivedValue(() => {
    const id = drag.activeId.get();
    return id !== null && column.order.get().includes(id) ? id : null;
  });
  const isOrigin = useDerivedValue(() => drag.fromColumnId.get() === columnId);

  // Ao aparecer, vai direto à vaga; nas trocas seguintes, desliza junto com os vizinhos.
  useAnimatedReaction(
    () => {
      const id = slotId.get();
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
    const id = slotId.get();
    return {
      opacity: id === null ? 0 : 1,
      height:
        id === null ? 0 : fixedHeight.get() || (drag.heights.get()[id] ?? ESTIMATED_CARD_HEIGHT),
      backgroundColor: isOrigin.get()
        ? colors.dropZoneOriginBackground
        : colors.dropZoneTargetBackground,
      transform: [{ translateY: top.get() }],
    };
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.placeholder, animatedStyle]}
    >
      <Text numberOfLines={1} className="text-caption text-primary">
        {ptBR.board.dropToReorder}
      </Text>
    </Animated.View>
  );
}

// Borda tracejada e posição animada: StyleSheet (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: RADIUS,
    borderWidth: BORDER_WIDTH,
    borderStyle: 'dashed',
    borderColor: colors.dropZoneBorder,
  },
});
