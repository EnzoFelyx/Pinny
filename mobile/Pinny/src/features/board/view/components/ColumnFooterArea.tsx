import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { ColumnFooter } from '@/components/Column';
import type { IllustrationVariant } from '@/components/StickyNoteIllustration';

import type { BoardDrag } from './useBoardDrag';

const SECTION_GAP = 12;

interface EmptyColumnAreaOptions {
  isEmpty: boolean;
  drag: BoardDrag;
  order: SharedValue<string[]>;
}

// Coluna vazia: a área do estado vazio tem tamanho fixo. Com o cartão por cima, o estado vazio
// fica transparente (sem sair do lugar) e a vaga é desenhada dentro dessa área, acima do
// "Adicionar cartão": a coluna não muda de tamanho. A troca é na UI thread, no mesmo quadro em
// que a vaga aparece (pelo React, os dois ficariam na tela por um instante).
export function useEmptyColumnArea({ isEmpty, drag, order }: EmptyColumnAreaOptions) {
  const isReceiving = useDerivedValue(() => {
    const id = drag.activeId.get();
    return id !== null && order.get().includes(id);
  });
  const emptyHeight = useSharedValue(0);
  const receivingFooterHeight = useSharedValue(0);
  // Altura da vaga na coluna vazia: o espaço do estado vazio menos o rodapé (0 = altura do cartão).
  const slotHeight = useDerivedValue(() =>
    isEmpty ? Math.max(0, emptyHeight.get() - receivingFooterHeight.get() - SECTION_GAP) : 0,
  );
  return { isReceiving, emptyHeight, receivingFooterHeight, slotHeight };
}

type EmptyColumnArea = ReturnType<typeof useEmptyColumnArea>;

interface ColumnFooterAreaProps {
  isEmpty: boolean;
  area: EmptyColumnArea;
  emptyMessage: string;
  emptyVariant: IllustrationVariant;
  onAddCard: () => void;
}

// Fim da coluna: o "Adicionar cartão" depois da lista ou, na coluna vazia, o estado vazio com o
// rodapé de quando um cartão está por cima.
export function ColumnFooterArea({
  isEmpty,
  area,
  emptyMessage,
  emptyVariant,
  onAddCard,
}: ColumnFooterAreaProps) {
  const emptyStateStyle = useAnimatedStyle(() => ({ opacity: area.isReceiving.get() ? 0 : 1 }));
  const receivingFooterStyle = useAnimatedStyle(() => ({
    opacity: area.isReceiving.get() ? 1 : 0,
  }));
  const measureEmpty = (event: LayoutChangeEvent) => {
    area.emptyHeight.set(event.nativeEvent.layout.height);
  };
  const measureReceivingFooter = (event: LayoutChangeEvent) => {
    area.receivingFooterHeight.set(event.nativeEvent.layout.height);
  };

  if (!isEmpty) {
    return (
      <View style={styles.footerAfterList}>
        <ColumnFooter isEmpty={false} onAddCard={onAddCard} />
      </View>
    );
  }

  return (
    <View onLayout={measureEmpty}>
      <Animated.View style={emptyStateStyle}>
        <ColumnFooter
          isEmpty
          onAddCard={onAddCard}
          emptyMessage={emptyMessage}
          emptyVariant={emptyVariant}
        />
      </Animated.View>
      {/* Só visual durante o arraste (nessa hora não dá para tocar em nada). */}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onLayout={measureReceivingFooter}
        style={[styles.receivingFooter, receivingFooterStyle]}
      >
        <ColumnFooter isEmpty={false} onAddCard={onAddCard} />
      </Animated.View>
    </View>
  );
}

// Posições do rodapé por cima da área vazia (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  footerAfterList: {
    marginTop: SECTION_GAP,
  },
  receivingFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
