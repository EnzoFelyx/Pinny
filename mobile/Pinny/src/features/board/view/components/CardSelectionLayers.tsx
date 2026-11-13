import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { CARD_CHECK_POSITION } from '@/components/Card';
import { SelectionCheck } from '@/components/SelectionCheck';
import { colors } from '@/theme';

import type { SelectionValues } from './useSelectionValues';

const CARD_RADIUS = 18;
// A borda do cartão (2, transparente) fica por baixo desta: a camada cobre o cartão inteiro.
const CARD_BORDER = 2;

interface CardSelectionLayerProps {
  id: string;
  selection: SelectionValues;
}

// Fundo lavanda com a borda roxa do cartão marcado (o mesmo visual do Card com isSelected), atrás
// do conteúdo. Aparece e some na UI thread, sem redesenhar o cartão.
export function CardSelectionBackground({ id, selection }: CardSelectionLayerProps) {
  const { marked } = selection;
  const style = useAnimatedStyle(() => ({ opacity: marked.get()?.[id] ? 1 : 0 }));
  return <Animated.View pointerEvents="none" style={[styles.background, style]} />;
}

// Bolinha do modo de seleção (vazia ou com o check), por cima do conteúdo, no mesmo lugar da do
// Card. Decorativa: o estado vai para o leitor de tela pelo próprio cartão.
export function CardSelectionCheck({ id, selection }: CardSelectionLayerProps) {
  const { marked, isCheckHidden } = selection;
  const visibleStyle = useAnimatedStyle(() => ({
    opacity: marked.get() !== null && !isCheckHidden.get() ? 1 : 0,
  }));
  const checkedStyle = useAnimatedStyle(() => ({ opacity: marked.get()?.[id] ? 1 : 0 }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, visibleStyle]}>
      <SelectionCheck isSelected={false} className={CARD_CHECK_POSITION} />
      <Animated.View style={[StyleSheet.absoluteFill, checkedStyle]}>
        <SelectionCheck isSelected className={CARD_CHECK_POSITION} />
      </Animated.View>
    </Animated.View>
  );
}

// Camadas animadas (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: -CARD_BORDER,
    left: -CARD_BORDER,
    right: -CARD_BORDER,
    bottom: -CARD_BORDER,
    borderRadius: CARD_RADIUS,
    borderWidth: CARD_BORDER,
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
});
