import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

// hairline = um pixel físico; regular = 1pt, um pouco mais visível (ex.: entre o calendário e o
// horário da folha "Data e horário").
export type DividerWeight = 'hairline' | 'regular';

interface HairlineDividerProps {
  // Espaços em volta da linha (ex.: "mx-2 mb-3 mt-2").
  className?: string;
  weight?: DividerWeight;
}

// Linha fina de separação (um pixel físico, na cor da borda decorativa). Decorativa: o leitor de
// tela não a lê.
export function HairlineDivider({ className, weight = 'hairline' }: HairlineDividerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles[weight]}
      className={className}
    />
  );
}

// Espessura de um pixel físico: valor do sistema, fora do className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  regular: { height: 1, backgroundColor: colors.border },
});
