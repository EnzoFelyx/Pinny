import type { ReactNode } from 'react';
import { StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { ptBR } from '@/i18n/pt-BR';
import { colors, columnLift } from '@/theme';

import type { ColumnDrag } from './useColumnDrag';

const COLUMN_RADIUS = 24;
const BORDER_WIDTH = 2;

interface ColumnSlotProps {
  columnId: string;
  // Posição da coluna no quadro.
  index: number;
  // Largura da coluna mais o espaço entre elas: quanto cada coluna desliza para abrir a vaga.
  pitch: number;
  reorderDuration: number;
  isReducedMotion: boolean;
  columnDrag: ColumnDrag;
  style: ViewStyle;
  children: ReactNode;
}

// Lugar de uma coluna no quadro durante o arraste de coluna: desliza para abrir espaço para a
// vaga, como os cartões, e a coluna segurada mostra a vaga tracejada com "Solte para reorganizar"
// do tamanho dela, onde vai cair. Ao soltar, a coluna verdadeira assume do ponto da cópia e
// assenta aqui dentro do quadro (acompanha a rolagem e já pode ser rolada). Decorativa: o leitor
// de tela usa "Mover para trás/frente".
export function ColumnSlot({
  columnId,
  index,
  pitch,
  reorderDuration,
  isReducedMotion,
  columnDrag,
  style,
  children,
}: ColumnSlotProps) {
  // Só os valores lidos (capturar o objeto inteiro faria tudo rodar a cada quadro do arraste).
  const { activeColumnId, isHolding, orderAtBegin, fromIndex, slotIndex, height } = columnDrag;
  const { handoffColumnId, handoffX, handoffY, handoffLift } = columnDrag;

  // Deslocamento até a posição em que a coluna aparece com a vaga aberta, contado a partir de
  // onde o React a desenha (index). Quando a nova ordem é desenhada, index já é essa posição e o
  // deslocamento vira zero sozinho: as colunas não pulam.
  const shift = useDerivedValue(() => {
    const from = fromIndex.get();
    const slot = slotIndex.get();
    const start = orderAtBegin.get().indexOf(columnId);
    if (from < 0 || slot < 0 || start < 0) return 0;
    let visual = start;
    if (start === from) visual = slot;
    else if (from < slot && start > from && start <= slot) visual = start - 1;
    else if (slot < from && start >= slot && start < from) visual = start + 1;
    return (visual - index) * pitch;
  });

  // Desliza enquanto o dedo segura; depois de soltar, só acompanha a nova ordem (sem animar).
  // A coluna que acabou de ser solta soma o pouso (deslocamento e giro indo a zero).
  const rotation = isReducedMotion ? 0 : columnLift.rotationDeg;
  const shiftStyle = useAnimatedStyle(() => {
    const isLanding = handoffColumnId.get() === columnId;
    const base = isHolding.get()
      ? withTiming(shift.get(), { duration: reorderDuration })
      : shift.get();
    return {
      zIndex: isLanding ? 1 : 0,
      transform: [
        { translateX: isLanding ? handoffX.get() : base },
        { translateY: isLanding ? handoffY.get() : 0 },
        { rotate: `${isLanding ? handoffLift.get() * rotation : 0}deg` },
      ],
    };
  });

  const placeholderStyle = useAnimatedStyle(() => {
    // Só enquanto o dedo segura: ao soltar, a vaga some e a coluna assenta no lugar.
    const isHere = isHolding.get() && activeColumnId.get() === columnId && slotIndex.get() >= 0;
    return {
      opacity: isHere ? 1 : 0,
      height: height.get(),
      backgroundColor:
        slotIndex.get() === fromIndex.get()
          ? colors.dropZoneOriginBackground
          : colors.dropZoneTargetBackground,
    };
  });

  return (
    <Animated.View style={[style, shiftStyle]}>
      {children}
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[styles.placeholder, placeholderStyle]}
      >
        <Text numberOfLines={1} className="text-caption text-primary">
          {ptBR.board.dropToReorder}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// Borda tracejada, deslocamento e altura animados: StyleSheet (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: COLUMN_RADIUS,
    borderWidth: BORDER_WIDTH,
    borderStyle: 'dashed',
    borderColor: colors.dropZoneBorder,
  },
});
