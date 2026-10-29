import { useWindowDimensions } from 'react-native';

// Largura da coluna em relação à tela: a próxima coluna aparece pela borda (dica de rolagem).
const COLUMN_WIDTH_RATIO = 0.75;
export const COLUMN_GAP = 12;

// Medidas das colunas do quadro, usadas pela tela do quadro e pela galeria de componentes.
export function useBoardColumnLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = Math.round(screenWidth * COLUMN_WIDTH_RATIO);
  // Cada "página" da rolagem horizontal é uma coluna mais o espaço entre elas.
  return { columnWidth, snapInterval: columnWidth + COLUMN_GAP };
}
