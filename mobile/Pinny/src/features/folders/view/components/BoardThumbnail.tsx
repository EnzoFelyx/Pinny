import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

interface BoardThumbnailProps {
  // Cor escura da pasta, usada nas "notas" da miniatura.
  noteColor: string;
}

// A coluna do meio tem a nota mais alta, como no Figma.
const COLUMN_NOTES = ['short', 'tall', 'short'] as const;

// Miniatura decorativa de um quadro: três colunas com notinhas. Escondida do leitor de tela.
export function BoardThumbnail({ noteColor }: BoardThumbnailProps) {
  // A cor vem da pasta em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const noteStyle = { backgroundColor: noteColor };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[30px] w-[30px] flex-row gap-[3px]"
    >
      {COLUMN_NOTES.map((size, index) => (
        <View key={index} className="h-[30px] w-2 gap-[3px] rounded-[3px] bg-background p-0.5">
          <View style={[styles.note, styles[size], noteStyle]} />
          <View style={[styles.note, styles.emptyNote]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { width: 4, borderRadius: 2 },
  short: { height: 7 },
  tall: { height: 12 },
  emptyNote: { height: 6, backgroundColor: colors.border },
});
