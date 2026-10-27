import { Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

// Placeholder até a etapa 5, quando a tela Início ganha View + ViewModel.
export default function IndexRoute() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text accessibilityRole="header" className="text-display text-text-primary">
        {ptBR.appName}
      </Text>
    </View>
  );
}
