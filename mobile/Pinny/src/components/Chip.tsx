import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { LabelColor } from '@/features/card/model/card.types';
import { colors } from '@/theme';

export type ChipEmphasis = 'default' | 'alert';

interface ChipProps {
  label: string;
  tone: LabelColor;
  icon?: LucideIcon;
  emphasis?: ChipEmphasis;
  accessibilityLabel?: string;
}

const ICON_SIZE = 12;

// Fundo de cada acento (também usado pelo seletor de cor das etiquetas).
export const labelToneClass: Record<LabelColor, string> = {
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  peach: 'bg-peach',
  babyBlue: 'bg-baby-blue',
  butter: 'bg-butter',
};

// Cor escura de cada acento (ícones sobre o fundo pastel; todas ≥ 4,4:1).
export const labelInkColor: Record<LabelColor, string> = {
  lavender: colors.lavenderInk,
  mint: colors.mintInk,
  peach: colors.peachInk,
  babyBlue: colors.babyBlueInk,
  butter: colors.butterInk,
};

const textClass: Record<ChipEmphasis, string> = {
  default: 'text-text-primary',
  alert: 'text-alert',
};

const iconColor: Record<ChipEmphasis, string> = {
  default: colors.textPrimary,
  alert: colors.alert,
};

// Base visual de etiquetas, prioridade e prazo: fundo pastel, texto escuro e ícone opcional.
export function Chip({
  label,
  tone,
  icon: Icon,
  emphasis = 'default',
  accessibilityLabel,
}: ChipProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      className={`flex-row items-center gap-1 self-start rounded-[12px] px-[9px] py-[5px] ${labelToneClass[tone]}`}
    >
      {Icon ? <Icon size={ICON_SIZE} color={iconColor[emphasis]} /> : null}
      <Text className={`text-tag ${textClass[emphasis]}`}>{label}</Text>
    </View>
  );
}
