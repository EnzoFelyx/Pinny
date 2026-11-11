import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// VoiceOver (ou TalkBack) ligado agora. Atualiza quando o usuário liga ou desliga.
export function useScreenReaderEnabled(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let isActive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (isActive) setIsEnabled(enabled);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao ler o estado do leitor de tela.', error);
      });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsEnabled);
    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  return isEnabled;
}
