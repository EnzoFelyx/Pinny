import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

function report(error: unknown) {
  console.warn('Não foi possível vibrar agora.', error);
}

// Feedback tátil do app. As funções são estáveis e podem ser chamadas da UI thread com
// scheduleOnRN (o arraste do quadro as usa a cada troca de vaga).
export function useHaptics() {
  return useMemo(
    () => ({
      // Cartão "levantado" ao começar o arraste.
      lift: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(report);
      },
      // Cada vez que o cartão passa para outra vaga.
      tick: () => {
        Haptics.selectionAsync().catch(report);
      },
      // Cartão solto na vaga.
      drop: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(report);
      },
    }),
    [],
  );
}
