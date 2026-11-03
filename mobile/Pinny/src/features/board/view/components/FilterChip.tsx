import { X } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

const REMOVE_ICON_SIZE = 14;
// Chip de 32pt (Figma "Quick filter"): o hitSlop completa os 44pt de área de toque.
const HIT_SLOP = 6;

interface FilterChipProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  // Filtro ligado: fundo lavanda e um "x" para remover (não depende só da cor).
  isActive?: boolean;
}

// Chip da linha de filtros do quadro: atalho (desligado) ou filtro ativo removível.
export function FilterChip({
  label,
  accessibilityLabel,
  onPress,
  isActive = false,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      className={`h-8 flex-row items-center gap-1 rounded-[12px] px-3 active:opacity-70 ${
        isActive ? 'bg-lavender' : 'bg-surface'
      }`}
    >
      <Text className="text-label text-text-primary">{label}</Text>
      {isActive ? <X size={REMOVE_ICON_SIZE} color={colors.textPrimary} /> : null}
    </Pressable>
  );
}
