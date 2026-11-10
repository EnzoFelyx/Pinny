import { useSharedValue } from 'react-native-reanimated';

// Shared values do arraste no quadro (o fantasma, a coluna sob o dedo e o cartão que está
// chegando em outra coluna). Só a criação: quem os usa é o useBoardDrag.
export function useDragValues() {
  const activeId = useSharedValue<string | null>(null);
  const fromColumnId = useSharedValue<string | null>(null);
  const overColumnId = useSharedValue<string | null>(null);
  const heights = useSharedValue<Record<string, number>>({});
  const x = useSharedValue(0);
  const startY = useSharedValue(0);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const width = useSharedValue(0);
  const lift = useSharedValue(0);
  const visibleId = useSharedValue<string | null>(null);
  const listOriginY = useSharedValue(0);
  const slotIndex = useSharedValue(-1);
  const landingId = useSharedValue<string | null>(null);
  const landingColumnId = useSharedValue<string | null>(null);
  const landingShift = useSharedValue(0);
  const originPageX = useSharedValue(0);
  const originPageY = useSharedValue(0);
  const beginScrollX = useSharedValue(0);
  // Posição do dedo na camada.
  const fingerX = useSharedValue(0);

  return {
    activeId,
    fromColumnId,
    overColumnId,
    heights,
    x,
    startY,
    translationX,
    translationY,
    width,
    lift,
    visibleId,
    listOriginY,
    slotIndex,
    landingId,
    landingColumnId,
    landingShift,
    originPageX,
    originPageY,
    beginScrollX,
    fingerX,
  };
}
