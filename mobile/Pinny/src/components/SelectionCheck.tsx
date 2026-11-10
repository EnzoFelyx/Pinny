import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme';

const CHECK_ICON_SIZE = 12;

interface SelectionCheckProps {
  isSelected: boolean;
  // Posição no item (ex.: "right-1.5 top-1.5"); o círculo é sempre absoluto.
  className: string;
}

// Círculo do modo de seleção, como nas fotos do iOS: vazio ou preenchido com o check. Decorativo:
// o estado vai para o leitor de tela pelo item (accessibilityState).
export function SelectionCheck({ isSelected, className }: SelectionCheckProps) {
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      className={`absolute h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
        isSelected ? 'border-primary bg-primary' : 'border-border-strong bg-surface'
      } ${className}`}
    >
      {isSelected ? <Check size={CHECK_ICON_SIZE} color={colors.textOnPrimary} /> : null}
    </View>
  );
}
