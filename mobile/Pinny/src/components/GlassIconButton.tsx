import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

interface GlassIconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
}

// Mesmo tamanho do h-[50px]/w-[50px] do botão sem vidro (já passa da área de toque mínima de 44pt).
const BUTTON_SIZE = 50;
const ICON_SIZE = 24;

// Botão redondo só com ícone. No iOS 26+ usa o Liquid Glass do sistema; antes dele, uma
// superfície clara com borda, para o botão continuar visível sobre o fundo creme.
export function GlassIconButton({ icon: Icon, accessibilityLabel, onPress }: GlassIconButtonProps) {
  const iconElement = <Icon size={ICON_SIZE} color={colors.textPrimary} />;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="active:opacity-40"
    >
      {/* O GlassView não aceita className: estilos via StyleSheet (REGRAS.md, regra 5). */}
      {isLiquidGlassAvailable() ? (
        // Sem isInteractive: o vidro não expande ao toque; o retorno visual é só o active:opacity-40.
        <GlassView style={styles.circle}>{iconElement}</GlassView>
      ) : (
        <View className="h-[50px] w-[50px] items-center justify-center rounded-full border border-border bg-surface">
          {iconElement}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
