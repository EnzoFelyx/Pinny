import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

// destructive = só texto, sem fundo, na cor de alerta (ex.: "Remover prazo").
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  accessibilityHint?: string;
}

const ICON_SIZE = 19;

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  destructive: 'bg-transparent',
};

const labelClass: Record<ButtonVariant, string> = {
  primary: 'text-text-on-primary',
  secondary: 'text-on-secondary',
  ghost: 'text-on-secondary',
  destructive: 'text-alert',
};

const iconColor: Record<ButtonVariant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.onSecondary,
  ghost: colors.onSecondary,
  destructive: colors.alert,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[52px] w-full flex-row items-center justify-center gap-[9px] rounded-[18px] px-4 active:opacity-80 ${
        disabled ? 'bg-disabled-background' : containerClass[variant]
      }`}
    >
      {Icon ? (
        <Icon size={ICON_SIZE} color={disabled ? colors.textDisabled : iconColor[variant]} />
      ) : null}
      <Text className={`text-card-title ${disabled ? 'text-text-disabled' : labelClass[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
