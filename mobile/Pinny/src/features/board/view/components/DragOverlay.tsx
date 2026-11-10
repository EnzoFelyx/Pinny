import { StyleSheet, type View } from 'react-native';
import Animated, { type AnimatedRef, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { colors, dragLift, shadows } from '@/theme';

import type { BoardCardItem } from '../../viewmodel/boardItems';
import { DragStack } from './DragStack';
import type { BoardDrag } from './useBoardDrag';

const CARD_RADIUS = 18;

interface DragOverlayProps {
  drag: BoardDrag;
  // Camada que serve de origem para as medidas do arraste (useBoardDrag).
  originRef: AnimatedRef<View>;
  card: BoardCardItem | null;
  // Modo de seleção: a cópia tem o visual de marcado, igual ao cartão da lista (sem a bolinha),
  // para nada mudar quando um troca pelo outro.
  isCardSelected: boolean;
  // Arraste em lote: os outros cartões da pilha (null = arraste de um cartão só).
  stack: { cards: readonly BoardCardItem[] } | null;
  isReducedMotion: boolean;
}

// Camada por cima da tela do quadro com o cartão segurado: levemente girado, maior e com
// sombra elevada (Figma "Quadro · Arrastar cartão"). Só visual: o leitor de tela não a vê.
export function DragOverlay({
  drag,
  originRef,
  card,
  isCardSelected,
  stack,
  isReducedMotion,
}: DragOverlayProps) {
  const rotation = isReducedMotion ? 0 : dragLift.rotationDeg;
  const scale = isReducedMotion ? 1 : dragLift.scale;

  // Segue o dedo enquanto arrasta; ao soltar, faz o quique na vaga, grudado na lista da coluna.
  const cardStyle = useAnimatedStyle(() => {
    const isSettling = drag.settleId.get() !== null;
    const lift = isSettling ? drag.settleLift.get() : drag.lift.get();
    return {
      // Escondido até ser desenhado e quando o original reaparece na lista.
      opacity: drag.visibleId.get() === null ? 0 : 1,
      width: drag.width.get(),
      transform: [
        {
          translateX: isSettling
            ? drag.settleListX.get() + drag.settleLeft.get()
            : drag.x.get() + drag.translationX.get(),
        },
        {
          translateY: isSettling
            ? drag.settleListY.get() + drag.settleTop.get()
            : drag.startY.get() + drag.translationY.get(),
        },
        { rotate: `${interpolate(lift, [0, 1], [0, rotation])}deg` },
        { scale: interpolate(lift, [0, 1], [1, scale]) },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() =>
    drag.settleId.get() !== null
      ? { opacity: drag.settleLift.get() }
      : { opacity: drag.lift.get() },
  );

  return (
    <Animated.View
      ref={originRef}
      // Medida no início do arraste (origem das posições): sem isto, vazia, o React Native a achata
      // e o measure do Reanimated não acha a view.
      collapsable={false}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {/* A pilha vem antes: fica por baixo do cartão segurado. */}
      {stack ? (
        <DragStack drag={drag} cards={stack.cards} isReducedMotion={isReducedMotion} />
      ) : null}
      {card ? (
        <Animated.View
          // Novo cartão = nova medida: o original só some quando o fantasma já está na tela.
          key={card.id}
          onLayout={() => drag.markVisible(card.id)}
          style={[styles.card, cardStyle]}
        >
          {/* Sombra elevada numa camada própria, para aparecer e sumir com fade. */}
          <Animated.View style={[styles.liftedShadow, shadowStyle]} />
          <Card
            title={card.title}
            titleParts={card.titleParts}
            accessibilityLabel={card.accessibilityLabel}
            labels={card.labels}
            priority={card.priority}
            deadline={card.deadline}
            checklistText={card.checklistText}
            isSelected={isCardSelected ? true : undefined}
            isCheckHidden
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
