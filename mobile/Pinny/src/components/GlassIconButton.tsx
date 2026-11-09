import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export type GlassIconTone = 'default' | 'muted' | 'destructive';

interface GlassIconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // muted = ícone cinza-escuro; destructive = ícone vermelho (ex.: excluir).
  tone?: GlassIconTone;
  // large = círculo de 60 (ex.: ações do modo "Selecionar").
  size?: GlassIconSize;
}

export type GlassIconSize = 'regular' | 'large';

const iconColor: Record<GlassIconTone, string> = {
  default: colors.textPrimary,
  muted: colors.textSecondary,
  destructive: colors.alert,
};

// Círculo e ícone por tamanho. O regular (40) é menor que a área de toque mínima do iOS (44pt):
// o hitSlop completa a diferença por fora, sem mudar o layout.
const BUTTON_SIZE: Record<GlassIconSize, number> = { regular: 40, large: 60 };
const ICON_SIZE: Record<GlassIconSize, number> = { regular: 20, large: 30 };
const MIN_TOUCH_SIZE = 44;

// Botão redondo só com ícone. No iOS 26+ usa o Liquid Glass do sistema; antes dele, uma
// superfície clara com borda, para o botão continuar visível sobre o fundo creme.
export function GlassIconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  tone = 'default',
  size = 'regular',
}: GlassIconButtonProps) {
  const iconElement = <Icon size={ICON_SIZE[size]} color={iconColor[tone]} />;
  const touchSlop = Math.max(0, (MIN_TOUCH_SIZE - BUTTON_SIZE[size]) / 2);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={touchSlop}
      className="active:opacity-40"
    >
      {/* O GlassView não aceita className: estilos via StyleSheet (REGRAS.md, regra 5). */}
      {isLiquidGlassAvailable() ? (
        // Sem isInteractive: o vidro não expande ao toque; o retorno visual é só o active:opacity-40.
        <GlassView style={styles[size]}>{iconElement}</GlassView>
      ) : (
        <View
          style={styles[size]}
          className="items-center justify-center rounded-full border border-border bg-surface"
        >
          {iconElement}
        </View>
      )}
    </Pressable>
  );
}

const circle = (diameter: number) => ({
  width: diameter,
  height: diameter,
  borderRadius: diameter / 2,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

const styles = StyleSheet.create({
  regular: circle(BUTTON_SIZE.regular),
  large: circle(BUTTON_SIZE.large),
});
