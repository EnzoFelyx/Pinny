import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { SNACKBAR_DURATION_MS } from '@/constants/limits';
import { duration } from '@/theme';

interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

// Aviso temporário no rodapé, usado para o "Desfazer" (alternativa visível ao chacoalhar).
// As animações de entrada e saída seguem o "Reduzir movimento" do sistema (padrão do Reanimated).
export function Snackbar({ visible, message, onDismiss, actionLabel, onAction }: SnackbarProps) {
  useEffect(() => {
    if (!visible) return;

    AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(onDismiss, SNACKBAR_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, message, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(duration.normal)}
      exiting={FadeOutDown.duration(duration.fast)}
      style={styles.position}
    >
      <View
        accessibilityLiveRegion="polite"
        className="flex-row items-center justify-between gap-3 rounded-[18px] bg-inverse-surface py-2 pl-4 pr-2 shadow-lifted"
      >
        <Text className="flex-1 text-body text-on-inverse-surface">{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            className="min-h-[44px] justify-center rounded-[12px] px-3 active:opacity-70"
          >
            <Text className="text-card-title text-inverse-action">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  position: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
});
