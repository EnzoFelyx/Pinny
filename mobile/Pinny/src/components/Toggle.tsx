import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, duration, shadows } from '@/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

// Figma: 44×28. Ajustado a pedido do autor: altura -10% e largura +10%.
const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 25;
const THUMB_INSET = 3;
const THUMB_SIZE = TRACK_HEIGHT - THUMB_INSET * 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;
// Leva a altura de toque de 25pt para 45pt (mínimo de 44pt).
const HIT_SLOP = { top: 10, bottom: 10 };

export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  const isReducedMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    const target = value ? 1 : 0;
    progress.set(isReducedMotion ? target : withTiming(target, { duration: duration.fast }));
  }, [value, isReducedMotion, progress]);

  // Estilos animados ficam fora do className (REGRAS.md, regra 5).
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      [colors.borderStrong, colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.get() * THUMB_TRAVEL }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={HIT_SLOP}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: THUMB_INSET,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surface,
    boxShadow: shadows.card,
  },
});
