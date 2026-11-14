import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

interface HairlineDividerProps {
  // Espaços em volta da linha (ex.: "mx-2 mb-3 mt-2").
  className?: string;
}

// Linha fina de separação (um pixel físico, na cor da borda decorativa). Decorativa: o leitor de
// tela não a lê.
export function HairlineDivider({ className }: HairlineDividerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.line}
      className={className}
    />
  );
}

// Espessura de um pixel físico: valor do sistema, fora do className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
