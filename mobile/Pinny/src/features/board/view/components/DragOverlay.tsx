import { StyleSheet, type View } from 'react-native';
import Animated, { type AnimatedRef, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { colors, dragLift, shadows } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { DragOverlay as DragOverlayState } from './useDragOverlay';

const CARD_RADIUS = 18;

interface DragOverlayProps {
  overlay: DragOverlayState;
  // A mesma ref de overlay.originRef, em prop própria (o React Compiler não aceita ler ref
  // de dentro de um objeto durante o render).
  originRef: AnimatedRef<View>;
  card: BoardCardItem | null;
  isReducedMotion: boolean;
}

// Camada por cima da tela do quadro com o cartão segurado: levemente girado, maior e com
// sombra elevada (Figma "Quadro · Arrastar cartão"). Só visual: o leitor de tela não a vê.
export function DragOverlay({ overlay, originRef, card, isReducedMotion }: DragOverlayProps) {
  const rotation = isReducedMotion ? 0 : dragLift.rotationDeg;
  const scale = isReducedMotion ? 1 : dragLift.scale;

  const cardStyle = useAnimatedStyle(() => ({
    // Escondido até ser desenhado e logo ao soltar, na mesma hora em que o original aparece.
    opacity: overlay.visibleId.get() === null ? 0 : 1,
    width: overlay.width.get(),
    transform: [
      { translateX: overlay.x.get() },
      { translateY: overlay.startY.get() + overlay.translationY.get() },
      { rotate: `${interpolate(overlay.lift.get(), [0, 1], [0, rotation])}deg` },
      { scale: interpolate(overlay.lift.get(), [0, 1], [1, scale]) },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({ opacity: overlay.lift.get() }));

  return (
    <Animated.View
      ref={originRef}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {card ? (
        <Animated.View
          // Novo cartão = nova medida: o original só some quando o fantasma já está na tela.
          key={card.id}
          onLayout={() => overlay.markVisible(card.id)}
          style={[styles.card, cardStyle]}
        >
          {/* Sombra elevada numa camada própria, para aparecer e sumir com fade. */}
          <Animated.View style={[styles.liftedShadow, shadowStyle]} />
          <Card
            title={card.title}
            accessibilityLabel={card.accessibilityLabel}
            labels={card.labels}
            priority={card.priority}
            deadline={card.deadline}
            checklistText={card.checklistText}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// Posição vem da medida do cartão na tela, em tempo de execução (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: CARD_RADIUS,
  },
  liftedShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.surface,
    boxShadow: shadows.lifted,
  },
});
