import '../global.css';

import { Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import { useDatabaseStatus } from '@/db/useDatabaseStatus';
import { SnackbarHost } from '@/features/feedback/view/SnackbarHost';
import { ShakeToUndoListener } from '@/features/history/view/ShakeToUndoListener';
import { ptBR } from '@/i18n/pt-BR';
import { registerCurrentRouteReader } from '@/navigation/openRoute';
import { colors } from '@/theme';

// Telas abertas por cima das abas: só o botão de voltar (o título fica na própria tela).
const pushedScreenOptions = {
  headerShown: true,
  title: '',
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
} as const;

// Folhas nativas do iOS: altura pelo conteúdo, puxador e arraste para fechar do sistema.
const sheetScreenOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
  contentStyle: { backgroundColor: colors.surface },
} as const;

// Folha com lista longa (SheetLayout com footer): começa em 40% e a tela mede o conteúdo e troca
// as paradas para [altura do conteúdo (40% a 60%), tela toda] (useSheetFitDetent).
const SCROLLABLE_SHEET_DETENTS: number[] = [0.4, 1];
const scrollableSheetScreenOptions = {
  ...sheetScreenOptions,
  sheetAllowedDetents: SCROLLABLE_SHEET_DETENTS,
};

export default function RootLayout() {
  const databaseStatus = useDatabaseStatus();
  // A trava de navegação (openRoute) lê daqui a rota que está na frente.
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    registerCurrentRouteReader(() =>
      navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined,
    );
  }, [navigationRef]);

  return (
    <GestureHandlerRootView style={styles.root}>
      {databaseStatus === 'ready' ? (
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            {/* O quadro desenha o próprio topo (voltar, título e menu na mesma linha). */}
            <Stack.Screen name="board/[boardId]/index" />
            {/* Arquivados: mesmo topo desenhado pela tela (como o quadro). */}
            <Stack.Screen name="board/[boardId]/archived" />
            <Stack.Screen name="board/[boardId]/move" options={scrollableSheetScreenOptions} />
            <Stack.Screen
              name="board/[boardId]/move-cards"
              options={scrollableSheetScreenOptions}
            />
            <Stack.Screen name="dev/gallery" options={pushedScreenOptions} />
            {/* A pasta também desenha o próprio topo (como o quadro). */}
            <Stack.Screen name="folder/[folderId]/index" />
            <Stack.Screen name="folder/new" options={sheetScreenOptions} />
            <Stack.Screen name="folder/[folderId]/rename" options={sheetScreenOptions} />
            <Stack.Screen name="folder/[folderId]/new-board" options={sheetScreenOptions} />
            {/* Tela do cartão: topo próprio (ScreenHeader), como o quadro e a pasta. */}
            <Stack.Screen name="card/[cardId]/index" />
            <Stack.Screen name="card/[cardId]/move" options={sheetScreenOptions} />
            <Stack.Screen name="card/[cardId]/labels" options={scrollableSheetScreenOptions} />
            <Stack.Screen name="card/[cardId]/new-label" options={sheetScreenOptions} />
            <Stack.Screen name="card/[cardId]/due-date" options={sheetScreenOptions} />
            <Stack.Screen name="card/[cardId]/camera-permission" options={sheetScreenOptions} />
            <Stack.Screen name="card/[cardId]/archived" options={scrollableSheetScreenOptions} />
            {/* Foto anexada: topo próprio (ScreenHeader), como a tela do cartão. */}
            <Stack.Screen name="card/[cardId]/photo/[attachmentId]" />
            <Stack.Screen name="column/new" options={sheetScreenOptions} />
          </Stack>
          {/* Chacoalhar para desfazer e o snackbar global valem para todas as telas. */}
          <ShakeToUndoListener />
          <SnackbarHost />
        </>
      ) : null}
      {databaseStatus === 'error' ? (
        <View className="flex-1 justify-center bg-background px-6">
          <EmptyState message={ptBR.common.databaseError} />
        </View>
      ) : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
