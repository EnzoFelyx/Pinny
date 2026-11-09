import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface GlassTextButtonProps {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
}

// Mesma altura do GlassIconButton (40), que costuma ficar na mesma linha. A área de toque vai até
// 44pt por fora (hitSlop), sem mudar o layout.
const BUTTON_HEIGHT = 40;
const MIN_TOUCH_SIZE = 44;
const TOUCH_SLOP = (MIN_TOUCH_SIZE - BUTTON_HEIGHT) / 2;

// Pílula com texto (ex.: "Cancelar" no topo do modo de seleção). No iOS 26+ usa o Liquid Glass do
// sistema; antes dele, uma superfície clara com borda, como o GlassIconButton.
export function GlassTextButton({ label, accessibilityLabel, onPress }: GlassTextButtonProps) {
  const labelElement = <Text className="text-card-title text-text-primary">{label}</Text>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={TOUCH_SLOP}
      className="active:opacity-40"
    >
      {/* O GlassView não aceita className: estilos via StyleSheet (REGRAS.md, regra 5). */}
      {isLiquidGlassAvailable() ? (
        <GlassView style={styles.pill}>{labelElement}</GlassView>
      ) : (
        <View style={styles.pill} className="border border-border bg-surface">
          {labelElement}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
