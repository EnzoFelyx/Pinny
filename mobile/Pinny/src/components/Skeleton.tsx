import {
  type ComponentRef,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';
import {
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, skeleton } from '@/theme';

// Andamento da faixa de brilho (0 = antes da borda esquerda da tela, 1 = depois da direita).
// null = sem faixa ("Reduzir movimento").
const ShimmerContext = createContext<SharedValue<number> | null>(null);

interface SkeletonGroupProps {
  // Lido uma vez pelo leitor de tela (as formas de dentro ficam escondidas dele). Sem ele, o grupo
  // todo fica escondido: use em só um grupo da tela, para o aviso não se repetir.
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  // Layout das formas de dentro (ex.: "flex-row gap-3").
  className?: string;
  children: ReactNode;
}

// Base dos skeleton loadings do app, no estilo do YouTube: só as barras (SkeletonBar) animam, com
// uma faixa de brilho que atravessa a tela da esquerda para a direita, sem parar. Todas as barras
// do grupo seguem a mesma faixa, então a onda passa por elas como uma só. Na UI thread.
export function SkeletonGroup({
  accessibilityLabel,
  style,
  className,
  children,
}: SkeletonGroupProps) {
  const isReducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    progress.set(
      withRepeat(withTiming(1, { duration: skeleton.shimmerMs, easing: Easing.linear }), -1, false),
    );
  }, [isReducedMotion, progress]);

  return (
    <View
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      accessibilityElementsHidden={accessibilityLabel === undefined}
      style={style}
    >
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        className={className}
      >
        <ShimmerContext.Provider value={isReducedMotion ? null : progress}>
          {children}
        </ShimmerContext.Provider>
      </View>
    </View>
  );
}

interface SkeletonBarProps {
  // Tamanho e cantos da forma (ex.: "h-[15px] w-4/5 rounded-[6px]").
  className: string;
}

// Forma do skeleton, na cor `skeleton`, com o pedaço da faixa de brilho que passa por ela.
export function SkeletonBar({ className }: SkeletonBarProps) {
  const progress = useContext(ShimmerContext);
  const { width: screenWidth } = useWindowDimensions();
  const gradientId = useId();
  const barRef = useRef<ComponentRef<typeof View>>(null);
  // Posição da barra na tela: a faixa é medida na tela inteira, para ser contínua entre as barras.
  const barX = useSharedValue(0);

  const measurePosition = () => {
    barRef.current?.measureInWindow((x: number) => barX.set(x));
  };

  const bandStyle = useAnimatedStyle(() => {
    const travel = screenWidth + skeleton.shimmerBandWidth;
    const bandX = (progress?.get() ?? 0) * travel - skeleton.shimmerBandWidth;
    return { transform: [{ translateX: bandX - barX.get() }] };
  });

  return (
    <View
      ref={barRef}
      onLayout={measurePosition}
      className={`overflow-hidden bg-skeleton ${className}`}
    >
      {progress ? (
        <Animated.View style={[styles.band, bandStyle]}>
          <Svg width={skeleton.shimmerBandWidth} height="100%">
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.skeletonHighlight} stopOpacity={0} />
                <Stop offset="0.5" stopColor={colors.skeletonHighlight} stopOpacity={1} />
                <Stop offset="1" stopColor={colors.skeletonHighlight} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

// Faixa animada e gradiente do SVG: style, não className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: skeleton.shimmerBandWidth,
  },
});
