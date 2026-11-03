import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

const CHEVRON_SIZE = 20;

interface MoreBoardsTileProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

// "+N ›" no lugar dos quadros que não cabem na Início: um link (texto roxo e seta,
// sem fundo), para não parecer mais um quadro. Abre a tela da pasta.
export function MoreBoardsTile({ label, accessibilityLabel, onPress }: MoreBoardsTileProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-[58px] flex-1 flex-row items-center justify-center gap-1 active:opacity-60"
    >
      <Text className="text-subtitle text-primary">{label}</Text>
      <ChevronRight size={CHEVRON_SIZE} color={colors.primary} />
    </Pressable>
  );
}
