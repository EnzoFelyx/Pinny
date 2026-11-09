import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { duration, pullToDelete } from '@/theme';

interface PullToDeleteOptions {
  scrollY: SharedValue<number>;
  isUserScrolling: SharedValue<boolean>;
  onArmed: () => void;
  onComplete: () => void;
  // Desligado no modo de seleção.
  isEnabled: boolean;
}

// Puxar a coluna para baixo além do limite e segurar: o anel enche em holdMs e, ao completar,
// pede a confirmação (onComplete). Soltar antes cancela. Tudo na UI thread.
export function usePullToDelete({
  scrollY,
  isUserScrolling,
  onArmed,
  onComplete,
  isEnabled,
}: PullToDeleteOptions) {
  const progress = useSharedValue(0);
  // Quanto a coluna está puxada para baixo (0 quando não está).
  const pull = useDerivedValue(() => Math.max(0, -scrollY.get()));
  // A lixeira só aparece com o dedo segurando a coluna: a inércia de uma rolagem forte, que
  // também passa do topo, não conta. Ao soltar, some rapidinho.
  const visibility = useDerivedValue<number>(() =>
    withTiming(isEnabled && isUserScrolling.get() ? 1 : 0, { duration: duration.fast }),
  );

  useAnimatedReaction(
    () => isEnabled && isUserScrolling.get() && pull.get() >= pullToDelete.distance,
    (isArmed, wasArmed) => {
      if (isArmed && !wasArmed) {
        scheduleOnRN(onArmed);
        progress.set(
          withTiming(1, { duration: pullToDelete.holdMs, easing: Easing.linear }, (finished) => {
            if (finished) scheduleOnRN(onComplete);
          }),
        );
      } else if (!isArmed && wasArmed) {
        cancelAnimation(progress);
        progress.set(withTiming(0, { duration: duration.fast }));
      }
    },
  );

  return { pull, progress, visibility };
}
