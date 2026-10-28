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

const toneClass: Record<LabelColor, string> = {
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  peach: 'bg-peach',
  babyBlue: 'bg-baby-blue',
  butter: 'bg-butter',
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
      className={`flex-row items-center gap-1 self-start rounded-[12px] px-[9px] py-[5px] ${toneClass[tone]}`}
    >
      {Icon ? <Icon size={ICON_SIZE} color={iconColor[emphasis]} /> : null}
      <Text className={`text-tag ${textClass[emphasis]}`}>{label}</Text>
    </View>
  );
}
