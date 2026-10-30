import { Check } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

interface OptionRowProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const CHECK_SIZE = 20;

// Opção de escolha única (como um botão de rádio): o selecionado tem fundo e ícone de visto, não
// só cor (CLAUDE.md, regra 14).
export function OptionRow({ label, isSelected, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      className={`min-h-11 flex-row items-center justify-between rounded-[14px] px-4 py-2.5 active:opacity-60 ${
        isSelected ? 'bg-secondary' : 'bg-transparent'
      }`}
    >
      <Text numberOfLines={1} className="shrink text-body text-text-primary">
        {label}
      </Text>
      {isSelected ? <Check size={CHECK_SIZE} color={colors.onSecondary} /> : null}
    </Pressable>
  );
}
