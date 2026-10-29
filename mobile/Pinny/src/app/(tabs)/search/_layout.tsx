import { Stack } from 'expo-router';

import { ptBR } from '@/i18n/pt-BR';
import { colors, fontFamily } from '@/theme';

// A aba de busca precisa de uma Stack: a barra de busca nativa vive no cabeçalho dela.
export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        title: ptBR.search.title,
        headerLargeTitle: true,
        headerTransparent: true,
        headerTintColor: colors.textPrimary,
        headerLargeTitleStyle: { fontFamily: fontFamily.extraBold, color: colors.textPrimary },
        headerTitleStyle: { fontFamily: fontFamily.extraBold, color: colors.textPrimary },
      }}
    />
  );
}
