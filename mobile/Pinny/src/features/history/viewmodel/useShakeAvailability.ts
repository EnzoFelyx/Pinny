import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { shakeService } from '../model/shakeService';

// Se o chacoalhar pode desfazer agora. Relido ao voltar para o app, porque a pessoa pode ter
// mudado o "Agitar para Desfazer" nos Ajustes do iPhone. null = ainda verificando.
export function useShakeAvailability(): boolean | null {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;
    const check = () => {
      shakeService
        .isAvailable()
        .then((available) => {
          if (isActive) setIsAvailable(available);
        })
        .catch((error: unknown) => {
          console.warn('Não foi possível verificar o chacoalhar.', error);
          if (isActive) setIsAvailable(false);
        });
    };

    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  return isAvailable;
}
