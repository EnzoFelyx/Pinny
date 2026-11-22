import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration } from '@/theme';

interface ProgressBarProps {
  // De 0 a 1.
  progress: number;
  accessibilityLabel: string;
}

const PERCENT = 100;

// Barra de progresso (ex.: checklist do cartão). Abre já no valor certo e, a cada mudança, a parte
// cheia desliza até o novo valor na UI thread. Com "Reduzir movimento", troca direto.
export function ProgressBar({ progress, accessibilityLabel }: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(clamped * PERCENT);
  const isMotionReduced = useReducedMotion();
  const filled = useSharedValue(clamped);

  useEffect(() => {
    filled.set(isMotionReduced ? clamped : withTiming(clamped, { duration: duration.normal }));
  }, [clamped, isMotionReduced, filled]);

  // Largura calculada em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const fillStyle = useAnimatedStyle(() => ({ width: `${filled.get() * PERCENT}%` }));

  return (
    <View
      // Sem "accessible", o VoiceOver não para na barra e o progresso não é lido.
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: PERCENT, now: percent }}
      className="h-[6px] w-full overflow-hidden rounded-full bg-border"
    >
      <Animated.View className="h-full rounded-full bg-primary" style={fillStyle} />
    </View>
  );
}
