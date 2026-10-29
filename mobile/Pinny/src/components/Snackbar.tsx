import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SNACKBAR_DURATION_MS } from '@/constants/limits';
import { colors, duration } from '@/theme';

interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
  // Ícone decorativo antes do texto (ex.: celular chacoalhando na dica do desfazer).
  icon?: LucideIcon;
}

const ICON_SIZE = 20;
// Distância da borda de baixo, acima da área segura (indicador de início do iPhone).
const BOTTOM_MARGIN = 24;

// Aviso temporário no rodapé, usado para o "Desfazer" (alternativa visível ao chacoalhar).
// As animações de entrada e saída seguem o "Reduzir movimento" do sistema (padrão do Reanimated).
export function Snackbar({
  visible,
  message,
  onDismiss,
  actionLabel,
  onAction,
  icon: Icon,
}: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const hasAction = Boolean(actionLabel && onAction);

  useEffect(() => {
    if (!visible) return;

    AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(onDismiss, SNACKBAR_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, message, onDismiss]);

  if (!visible) return null;

  // Depende da área segura do aparelho: caso permitido de style (REGRAS.md, regra 5).
  const offsetStyle = { bottom: insets.bottom + BOTTOM_MARGIN };

  return (
    <Animated.View
      entering={FadeInDown.duration(duration.normal)}
      exiting={FadeOutDown.duration(duration.fast)}
      style={[styles.position, offsetStyle]}
    >
      <View
        accessibilityLiveRegion="polite"
        className={`min-h-[60px] flex-row items-center justify-between gap-3 rounded-[18px] bg-inverse-surface py-2 pl-4 shadow-lifted ${hasAction ? 'pr-2' : 'pr-4'}`}
      >
        {Icon ? <Icon size={ICON_SIZE} color={colors.inverseAction} /> : null}
        <Text className="flex-1 text-body text-on-inverse-surface">{message}</Text>
        {hasAction ? (
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
  },
});
