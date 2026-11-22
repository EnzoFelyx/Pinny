import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { photoService } from '../model/photoService';
import { cameraPermissionSignal } from './cameraPermissionSignal';

// Folha que explica a câmera antes do pedido do sistema. "Continuar" mostra o pedido e fecha a
// folha; liberada, a tela do cartão abre a câmera ao voltar à frente. "Agora não" só fecha (o app
// continua funcionando, e a galeria não precisa de permissão).
export function useCameraPermissionViewModel() {
  const [isAsking, setIsAsking] = useState(false);

  const allow = useCallback(async () => {
    setIsAsking(true);
    let isGranted = false;
    try {
      isGranted = await photoService.requestCameraAccess();
    } catch (error: unknown) {
      console.warn('Falha ao pedir a permissão da câmera.', error);
    }
    cameraPermissionSignal.emit(isGranted);
    router.back();
  }, []);

  return { isAsking, allow, dismiss: router.back };
}
