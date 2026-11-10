import { ChevronRight, Layers } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

// Mesmo tamanho do ícone dos quadros.
const STACK_ICON_SIZE = 20;
const CHEVRON_SIZE = 16;

interface MoreBoardsTileProps {
  accessibilityLabel: string;
  onPress: () => void;
}

// Última vaga da pasta na Início: pilha e "Ver todos ›", alinhados como o ícone e o nome dos
// quadros, do mesmo tamanho dos outros blocos, em lavanda. Abre a tela da pasta.
export function MoreBoardsTile({ accessibilityLabel, onPress }: MoreBoardsTileProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-[64px] flex-1 flex-row items-center gap-2 rounded-[12px] bg-lavender p-2.5 pl-3.5 active:opacity-70"
    >
      <Layers size={STACK_ICON_SIZE} color={colors.onSecondary} />
      <View className="flex-1 flex-row items-center gap-0.5">
        <Text numberOfLines={1} className="shrink text-card-title text-on-secondary">
          {ptBR.folders.seeAll}
        </Text>
        <ChevronRight size={CHEVRON_SIZE} color={colors.onSecondary} />
      </View>
    </Pressable>
  );
}
