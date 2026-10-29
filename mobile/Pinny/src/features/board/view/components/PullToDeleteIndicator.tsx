import { Trash2 } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, pullToDelete } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 52;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ICON_SIZE = 22;
const TOP_OFFSET = 18;
// A lixeira começa a aparecer depois deste tanto de puxada.
const FADE_START = 16;

interface PullToDeleteIndicatorProps {
  pull: SharedValue<number>;
  progress: SharedValue<number>;
  // 1 com o dedo segurando a coluna, 0 sem (ex.: inércia de uma rolagem forte).
  visibility: SharedValue<number>;
}

// Lixeira que aparece atrás da coluna ao puxá-la para baixo. O anel vermelho enche enquanto
// a pessoa segura. Decorativa: excluir também vai estar no menu da coluna (etapa 6.3).
export function PullToDeleteIndicator({ pull, progress, visibility }: PullToDeleteIndicatorProps) {
  const containerStyle = useAnimatedStyle(() => ({
    opacity:
      visibility.get() *
      interpolate(pull.get(), [FADE_START, pullToDelete.distance], [0, 1], 'clamp'),
    transform: [
      { scale: interpolate(pull.get(), [FADE_START, pullToDelete.distance], [0.6, 1], 'clamp') },
    ],
  }));

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.get()),
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.container, containerStyle]}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.alert}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={ringProps}
          // Começa no topo do círculo (o SVG começa à direita).
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Trash2 size={ICON_SIZE} color={colors.alert} />
    </Animated.View>
  );
}

// Posição e tamanho fixos do indicador; opacidade e escala animadas (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: TOP_OFFSET,
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
