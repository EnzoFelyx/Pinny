import type { View } from 'react-native';
import type { AnimatedRef, DerivedValue, SharedValue } from 'react-native-reanimated';

// Espaço entre os cartões e altura usada antes de o cartão ser medido (Figma: 110 + 10).
export const CARD_GAP = 10;
export const ESTIMATED_CARD_HEIGHT = 110;

export interface SortableColumn {
  order: SharedValue<string[]>;
  offsets: DerivedValue<Record<string, number>>;
  contentHeight: DerivedValue<number>;
  // true quando todos os cartões já foram medidos (a partir daí, mudanças deslizam).
  isLaidOut: DerivedValue<boolean>;
  // Topo do cartão arrastado nas coordenadas desta lista (acompanha o dedo e as rolagens).
  dragTop: DerivedValue<number>;
  viewportHeight: SharedValue<number>;
  // Onde a lista começa dentro da coluna (abaixo do cabeçalho fixo) e a altura de todo o conteúdo.
  listTop: SharedValue<number>;
  scrollContentHeight: SharedValue<number>;
  // Rolagem da coluna (negativa quando puxada para baixo além do topo).
  scrollY: SharedValue<number>;
  isUserScrolling: SharedValue<boolean>;
  // Lista dos cartões (sem transform), medida para posicionar o cartão na camada de arraste.
  listRef: AnimatedRef<View>;
  startDrag: (id: string) => void;
  // Solta o cartão na própria coluna e devolve o topo da vaga final.
  endDrag: () => number;
}
