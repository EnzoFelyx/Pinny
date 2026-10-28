import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

interface FabProps {
  icon: LucideIcon;
  // Botão só com ícone: o rótulo é a única coisa que o leitor de tela anuncia.
  accessibilityLabel: string;
  onPress: () => void;
  accessibilityHint?: string;
}

const ICON_SIZE = 27;

export function Fab({ icon: Icon, accessibilityLabel, onPress, accessibilityHint }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className="h-[58px] w-[58px] items-center justify-center rounded-[24px] bg-primary shadow-lifted active:opacity-80"
    >
      <Icon size={ICON_SIZE} color={colors.textOnPrimary} />
    </Pressable>
  );
}
