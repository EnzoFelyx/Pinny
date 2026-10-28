import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Acompanha a opção "Reduzir movimento" do sistema, inclusive se ela mudar com o app aberto.
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let isActive = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isActive) setIsReduced(enabled);
      })
      .catch((error: unknown) => {
        console.warn('Não foi possível ler a opção "Reduzir movimento".', error);
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  return isReduced;
}
