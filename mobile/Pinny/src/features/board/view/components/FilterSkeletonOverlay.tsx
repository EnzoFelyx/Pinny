import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, duration, skeleton } from '@/theme';

import { BoardSkeleton } from './BoardSkeleton';

interface FilterSkeletonOverlayProps {
  // Largura de uma coluna (vem da tela, em tempo de execução).
  columnStyle: StyleProp<ViewStyle>;
}

const SCREEN_GUTTER = 24;

// Skeleton por cima das colunas enquanto o quadro filtrado é montado em segundo plano. O atraso
// da entrada roda na UI thread (sem timer no React, que interromperia a montagem): numa troca
// rápida, ele sai antes de aparecer.
export function FilterSkeletonOverlay({ columnStyle }: FilterSkeletonOverlayProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(skeleton.filterDelayMs).duration(duration.fast)}
      exiting={FadeOut.duration(duration.normal)}
      pointerEvents="none"
      style={styles.overlay}
    >
      <BoardSkeleton columnStyle={columnStyle} />
    </Animated.View>
  );
}

// Camada absoluta animada sobre a rolagem do quadro (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    paddingHorizontal: SCREEN_GUTTER,
  },
});
