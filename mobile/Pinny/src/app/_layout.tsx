import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import { useDatabaseStatus } from '@/db/useDatabaseStatus';
import { ptBR } from '@/i18n/pt-BR';

export default function RootLayout() {
  const databaseStatus = useDatabaseStatus();

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        {databaseStatus === 'ready' ? <Stack screenOptions={{ headerShown: false }} /> : null}
        {databaseStatus === 'error' ? (
          <View className="flex-1 justify-center bg-background px-6">
            <EmptyState message={ptBR.common.databaseError} />
          </View>
        ) : null}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
