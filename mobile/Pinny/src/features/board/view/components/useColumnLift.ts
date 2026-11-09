import type { View } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import { useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { DRAG_ACTIVATION_MS } from '@/theme';

import type { ColumnDrag } from './useColumnDrag';

interface ColumnLiftOptions {
  columnId: string;
  // Editando o título: segurar o cabeçalho não levanta a coluna.
  isEnabled: boolean;
  columnDrag: ColumnDrag;
  onLift: () => void;
}

// Segurar o cabeçalho da coluna a levanta para reordenar: a cópia vai para a camada por cima de
// tudo (ColumnDragOverlay) e segue o dedo nos dois eixos; esta coluna fica invisível no lugar.
export function useColumnLift({ columnId, isEnabled, columnDrag, onLift }: ColumnLiftOptions) {
  // Parte visível da coluna: é dela a medida de onde a cópia começa.
  const frameRef = useAnimatedRef<View>();
  const { activeColumnId, begin, move, end } = columnDrag;

  const gesture = usePanGesture({
    enabled: isEnabled,
    activateAfterLongPress: DRAG_ACTIVATION_MS,
    onActivate: (event) => {
      'worklet';
      begin(columnId, frameRef, event.absoluteX);
      scheduleOnRN(onLift);
    },
    onUpdate: (event) => {
      'worklet';
      move(event.translationX, event.translationY, event.absoluteX);
    },
    onFinalize: () => {
      'worklet';
      end();
    },
  });

  // Invisível enquanto a cópia a representa (arraste e volta).
  const hiddenStyle = useAnimatedStyle(() => ({
    opacity: activeColumnId.get() === columnId ? 0 : 1,
  }));

  return { gesture, frameRef, hiddenStyle };
}
