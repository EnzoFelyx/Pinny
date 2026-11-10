import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors } from '@/theme';

interface GlassSearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}

// 2 a mais em cima e embaixo que o GlassIconButton (40) da mesma linha (decisão do autor).
const FIELD_HEIGHT = 44;
const ICON_SIZE = 18;

// Campo de busca em pílula de Liquid Glass (iOS 26+), que ocupa o espaço que sobrar na linha (ex.:
// entre o voltar e o "X" do quadro). Abre já com o teclado. Antes do iOS 26, uma superfície clara
// com borda, como os outros botões de vidro.
export function GlassSearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: GlassSearchFieldProps) {
  const content: ReactNode = (
    <>
      <Search size={ICON_SIZE} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 text-body text-text-primary"
      />
    </>
  );

  // O GlassView não aceita className: estilos via StyleSheet (REGRAS.md, regra 5).
  return isLiquidGlassAvailable() ? (
    <GlassView style={styles.pill}>{content}</GlassView>
  ) : (
    <View style={styles.pill} className="border border-border-strong bg-surface">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    height: FIELD_HEIGHT,
    borderRadius: FIELD_HEIGHT / 2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
