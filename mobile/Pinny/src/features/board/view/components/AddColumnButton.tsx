import { Plus } from 'lucide-react-native';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { ColumnFooter, ColumnHeader } from '@/components/Column';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { ADD_COLUMN_SLOT } from './boardDrag.types';
import type { BoardDrag } from './useBoardDrag';

interface AddColumnButtonProps {
  // Largura de uma coluna (vem da tela, em tempo de execução).
  style: StyleProp<ViewStyle>;
  drag: BoardDrag;
  onPress: () => void;
}

// 20% maior que os 22 do Figma (pedido do autor).
const ICON_SIZE = 26;
const TARGET_RADIUS = 24;
const TARGET_BORDER_WIDTH = 2;

function noop() {}

// Coluna "fantasma" no fim do quadro (Figma "Ghost column · Add column"): borda tracejada, o "+"
// e a legenda do autor no lugar do "Add column". Tem a altura de uma coluna vazia: o mesmo
// conteúdo fica desenhado invisível por dentro só para dar o tamanho (acompanha até o tamanho de
// fonte do sistema).
export function AddColumnButton({ style, drag, onPress }: AddColumnButtonProps) {
  // Cartão arrastado por cima: acende como a vaga de destino e explica o atalho (soltar cria a
  // coluna com o cartão). Troca na UI thread, sem passar pelo React.
  const isTarget = useDerivedValue(() => drag.overColumnId.get() === ADD_COLUMN_SLOT);
  const idleStyle = useAnimatedStyle(() => ({ opacity: isTarget.get() ? 0 : 1 }));
  const targetStyle = useAnimatedStyle(() => ({ opacity: isTarget.get() ? 1 : 0 }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ptBR.board.addColumn}
      onPress={onPress}
      style={style}
      className="self-start rounded-[24px] border border-dashed border-add-column-border px-4 pb-4 active:opacity-60"
    >
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="opacity-0"
      >
        <ColumnHeader title={ptBR.board.addColumn} cardCount={0} onOpenMenu={noop} />
        <ColumnFooter isEmpty onAddCard={noop} />
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.center, idleStyle]}
        className="gap-3.5 px-6"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-column-background">
          <Plus size={ICON_SIZE} color={colors.onSecondary} />
        </View>
        <Text className="text-center text-body text-on-secondary">{ptBR.board.addColumnHint}</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.center, styles.target, targetStyle]}
        className="gap-3.5 px-6"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
          <Plus size={ICON_SIZE} color={colors.onSecondary} />
        </View>
        <Text className="text-center text-body text-primary">{ptBR.board.addColumnDropHint}</Text>
      </Animated.View>
    </Pressable>
  );
}

// Ícone e legenda centralizados por cima do conteúdo invisível; a camada de destino cobre a borda
// fina com a tracejada da vaga (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    margin: -1,
    borderRadius: TARGET_RADIUS,
    borderWidth: TARGET_BORDER_WIDTH,
    borderStyle: 'dashed',
    borderColor: colors.dropZoneBorder,
    backgroundColor: colors.dropZoneTargetBackground,
  },
});
