import { ChevronDown } from 'lucide-react-native';
import { type ReactNode, useEffect } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { CountBadge } from '@/components/CountBadge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, duration } from '@/theme';

interface ArchivedSectionProps {
  title: string;
  count: number;
  accessibilityLabel: string;
  isExpanded: boolean;
  onToggle: () => void;
  // À direita do cabeçalho, fora da área de abrir/fechar (ex.: "Selecionar todos").
  accessory?: ReactNode;
  children: ReactNode;
}

const CHEVRON_SIZE = 18;
const CLOSED_CHEVRON_DEG = -90;

// Seção recolhível da tela "Arquivados" (uma por coluna de origem): cabeçalho com o chevron (para
// baixo aberta, para a direita fechada), o nome e a contagem. O conteúdo continua montado quando
// fecha: só a altura anima até zero, na UI thread. Com "Reduzir movimento", abre e fecha direto.
export function ArchivedSection({
  title,
  count,
  accessibilityLabel,
  isExpanded,
  onToggle,
  accessory,
  children,
}: ArchivedSectionProps) {
  const isMotionReduced = useReducedMotion();
  const progress = useSharedValue(isExpanded ? 1 : 0);
  // Altura natural do conteúdo (0 = ainda não medida: a seção usa a altura automática).
  const contentHeight = useSharedValue(0);

  useEffect(() => {
    const target = isExpanded ? 1 : 0;
    progress.set(isMotionReduced ? target : withTiming(target, { duration: duration.normal }));
  }, [isExpanded, isMotionReduced, progress]);

  const bodyStyle = useAnimatedStyle(() => {
    const height = contentHeight.get();
    return height === 0 ? {} : { height: height * progress.get() };
  });
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(1 - progress.get()) * CLOSED_CHEVRON_DEG}deg` }],
  }));

  const measureContent = (event: LayoutChangeEvent) => {
    contentHeight.set(event.nativeEvent.layout.height);
  };

  return (
    <View className="w-full rounded-[24px] bg-column-background">
      <View className="flex-row items-center px-4 py-1.5">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={accessibilityLabel}
          onPress={onToggle}
          className="min-h-11 flex-1 flex-row items-center gap-2 active:opacity-60"
        >
          <Animated.View style={chevronStyle}>
            <ChevronDown size={CHEVRON_SIZE} color={colors.textSecondary} />
          </Animated.View>
          <Text numberOfLines={1} className="flex-1 text-subtitle text-text-primary">
            {title}
          </Text>
          <CountBadge count={count} />
        </Pressable>
        {accessory ? <View className="ml-3 h-11 justify-center">{accessory}</View> : null}
      </View>

      {/* O conteúdo não encolhe (flexShrink 0): a medida é sempre a altura natural dele, e o
          overflow corta o que passa da altura animada. Fechada, some para o leitor de tela. */}
      <Animated.View
        style={bodyStyle}
        className="overflow-hidden"
        pointerEvents={isExpanded ? 'auto' : 'none'}
        accessibilityElementsHidden={!isExpanded}
        importantForAccessibility={isExpanded ? 'auto' : 'no-hide-descendants'}
      >
        <View onLayout={measureContent} className="gap-3 px-4 pb-4 pt-1">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
