import { Plus } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

interface AddBoardTileProps {
  accessibilityLabel: string;
  // Pasta vazia: o bloco ocupa a linha toda com este texto ao lado do "+".
  label?: string | null;
  onPress: () => void;
}

const PLUS_SIZE = 20;

// "+" para criar um quadro na pasta, com a borda tracejada da coluna "Adicionar coluna" (uma
// ação, não um quadro). Depois do último quadro, é um quadrado da altura do bloco do quadro; na
// pasta vazia, ocupa a linha com "Criar o primeiro quadro".
export function AddBoardTile({ accessibilityLabel, label, onPress }: AddBoardTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`h-[58px] flex-row items-center justify-center gap-2 rounded-[12px] border border-dashed border-add-column-border active:opacity-60 ${
        label ? 'w-full' : 'w-[58px]'
      }`}
    >
      <Plus size={PLUS_SIZE} color={colors.primary} />
      {label ? <Text className="text-label text-primary">{label}</Text> : null}
    </Pressable>
  );
}
