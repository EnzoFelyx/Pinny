import { Plus } from 'lucide-react-native';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { ColumnFooter, ColumnHeader } from '@/components/Column';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

interface AddColumnButtonProps {
  // Largura de uma coluna (vem da tela, em tempo de execução).
  style: StyleProp<ViewStyle>;
  onPress: () => void;
}

// 20% maior que os 22 do Figma (pedido do autor).
const ICON_SIZE = 26;

function noop() {}

// Coluna "fantasma" no fim do quadro (Figma "Ghost column · Add column"): borda tracejada, o "+"
// e a legenda do autor no lugar do "Add column". Tem a altura de uma coluna vazia: o mesmo
// conteúdo fica desenhado invisível por dentro só para dar o tamanho (acompanha até o tamanho de
// fonte do sistema).
export function AddColumnButton({ style, onPress }: AddColumnButtonProps) {
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
      <View pointerEvents="none" style={styles.center} className="gap-3.5 px-6">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-column-background">
          <Plus size={ICON_SIZE} color={colors.onSecondary} />
        </View>
        <Text className="text-center text-body text-on-secondary">{ptBR.board.addColumnHint}</Text>
      </View>
    </Pressable>
  );
}

// Ícone e legenda centralizados por cima do conteúdo invisível (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
