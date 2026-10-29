import { router } from 'expo-router';
import { useCallback } from 'react';

// Configurações completas chegam na etapa 12.
export function useSettingsViewModel() {
  return {
    // A galeria de componentes só existe em desenvolvimento.
    showDeveloperTools: __DEV__,
    openComponentGallery: useCallback(() => router.push('/dev/gallery'), []),
  };
}
