import { Check } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

export type OptionRowSize = 'regular' | 'large';

interface OptionRowProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  // large = fonte e linha maiores (ex.: pastas da folha "Mover quadro").
  size?: OptionRowSize;
}

const rowClass: Record<OptionRowSize, string> = {
  regular: 'min-h-11 rounded-[14px] px-4 py-2.5',
  large: 'min-h-14 rounded-[16px] px-4 py-3.5',
};

const labelClass: Record<OptionRowSize, string> = {
  regular: 'text-body',
  large: 'text-card-title',
};

const CHECK_SIZE: Record<OptionRowSize, number> = { regular: 20, large: 22 };

// Opção de escolha única (como um botão de rádio): o selecionado tem fundo e ícone de visto, não
// só cor (CLAUDE.md, regra 14).
export function OptionRow({ label, isSelected, onPress, size = 'regular' }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      className={`flex-row items-center justify-between active:opacity-60 ${rowClass[size]} ${
        isSelected ? 'bg-secondary' : 'bg-transparent'
      }`}
    >
      <Text numberOfLines={1} className={`shrink text-text-primary ${labelClass[size]}`}>
        {label}
      </Text>
      {isSelected ? <Check size={CHECK_SIZE[size]} color={colors.onSecondary} /> : null}
    </Pressable>
  );
}
