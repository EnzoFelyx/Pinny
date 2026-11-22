import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { batchStack, colors, dragLift, shadows } from '@/theme';

import { stackRotation } from '../../model/batchStack';
import type { BoardCardItem } from '../../viewmodel/boardItems';
import type { BoardDrag } from './useBoardDrag';

const CARD_RADIUS = 18;

interface DragStackProps {
  drag: BoardDrag;
  // Os outros cartões da pilha (sem o segurado), na ordem: o primeiro fica logo embaixo dele.
  cards: readonly BoardCardItem[];
  isReducedMotion: boolean;
}

// Pilha do arraste em lote: cópias dos outros marcados que voam do lugar de cada um até baixo do
// cartão segurado e depois seguem o dedo com ele, com ângulos alternando os lados. Desenhada antes
// do segurado na camada (fica por baixo dele). Só visual.
export function DragStack({ drag, cards, isReducedMotion }: DragStackProps) {
  // O último da lista é o de mais baixo: desenhado primeiro.
  return (
    <>
      {[...cards].reverse().map((card) => (
        <StackCard
          key={card.id}
          card={card}
          depth={cards.indexOf(card) + 1}
          drag={drag}
          isReducedMotion={isReducedMotion}
        />
      ))}
    </>
  );
}

interface StackCardProps {
  card: BoardCardItem;
  // Posição na pilha (1 = logo embaixo do segurado).
  depth: number;
  drag: BoardDrag;
  isReducedMotion: boolean;
}

function StackCard({ card, depth, drag, isReducedMotion }: StackCardProps) {
  const { id } = card;
  // Só os valores lidos: o mapper roda a cada quadro do arraste (REGRAS do quadro, CLAUDE.md).
  const { x, startY, translationX, translationY, width, heights } = drag;
  const { gather, gatherFrom, stackOpacity, heldId } = drag.batch;
  const rotation = isReducedMotion
    ? 0
    : stackRotation(depth, dragLift.rotationDeg, batchStack.rotationStepDeg);
  const scale = isReducedMotion ? 1 : dragLift.scale;
  const drop = depth * batchStack.offsetY;

  const style = useAnimatedStyle(() => {
    const progress = gather.get();
    const heldX = x.get() + translationX.get();
    // Centralizada na altura do segurado: cópia mais alta sobra por igual em cima e embaixo (sem
    // uma borda grande só embaixo). Sem medida, alinha pelo topo.
    const held = heldId.get();
    const heldHeight = held === null ? undefined : heights.get()[held];
    const ownHeight = heights.get()[id];
    const center =
      heldHeight === undefined || ownHeight === undefined ? 0 : (heldHeight - ownHeight) / 2;
    const heldY = startY.get() + translationY.get() + center + drop;
    const from = isReducedMotion ? undefined : gatherFrom.get()[id];
    // Sem lugar de origem (fora da tela, filtro ou "Reduzir movimento"): aparece já na pilha.
    const left = from ? interpolate(progress, [0, 1], [from.x, heldX]) : heldX;
    const top = from ? interpolate(progress, [0, 1], [from.y, heldY]) : heldY;
    return {
      opacity: (from ? 1 : progress) * stackOpacity.get(),
      width: from ? interpolate(progress, [0, 1], [from.width, width.get()]) : width.get(),
      transform: [
        { translateX: left },
        { translateY: top },
        { rotate: `${interpolate(progress, [0, 1], [0, rotation])}deg` },
        { scale: interpolate(progress, [0, 1], [1, scale]) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, style]}>
      <Animated.View style={styles.shadow} />
      <Card
        title={card.title}
        accessibilityLabel={card.accessibilityLabel}
        labels={card.labels}
        priority={card.priority}
        deadline={card.deadline}
        checklistText={card.checklistText}
        thumbnail={card.thumbnail}
        // Todos da pilha estão marcados: mesmo visual da coluna, sem a bolinha.
        isSelected
        isCheckHidden
      />
    </Animated.View>
  );
}

// Posição vem do arraste, em tempo de execução (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  card: { position: 'absolute', top: 0, left: 0, borderRadius: CARD_RADIUS },
  shadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.surface,
    boxShadow: shadows.lifted,
  },
});
