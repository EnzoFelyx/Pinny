import { StyleSheet, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

// Placeholder até a etapa 5, quando a tela Início ganha View + ViewModel.
export default function IndexRoute() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header">{ptBR.appName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
