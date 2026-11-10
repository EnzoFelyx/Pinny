import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { useHaptics } from '@/hooks/useHaptics';
import { ptBR } from '@/i18n/pt-BR';

import { historyStore } from '../model/historyStore';
import { shakeService } from '../model/shakeService';
import { buildShakePrompt, type ShakeChoice, type ShakePrompt } from '../model/shakePrompt';
import { useShakeAvailability } from './useShakeAvailability';

const text = ptBR.history;

// Chacoalhar abre o alerta de desfazer/refazer, como no iOS. Nada é desfeito sem confirmação,
// e sem nada no histórico o chacoalhar não faz nada. O acelerômetro só fica ligado com o app
// aberto e com o "Agitar para Desfazer" do sistema ligado.
export function useShakeToUndo() {
  const isAvailable = useShakeAvailability();
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  const [prompt, setPrompt] = useState<ShakePrompt | null>(null);
  // Com um alerta aberto, novos chacoalhões são ignorados.
  const isPromptOpen = useRef(false);
  const haptics = useHaptics();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setIsForeground(state === 'active'),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAvailable || !isForeground) return;
    return shakeService.subscribe(() => {
      if (isPromptOpen.current) return;
      const next = buildShakePrompt(historyStore.nextUndoName(), historyStore.nextRedoName(), text);
      if (!next) return;
      isPromptOpen.current = true;
      setPrompt(next);
    });
  }, [isAvailable, isForeground]);

  const dismiss = useCallback(() => {
    isPromptOpen.current = false;
    setPrompt(null);
  }, []);

  const choose = useCallback(
    async (choice: ShakeChoice) => {
      dismiss();
      try {
        const entry =
          choice === 'undo' ? await historyStore.undoLast() : await historyStore.redoLast();
        if (entry) haptics.drop();
      } catch (error: unknown) {
        console.warn('Falha ao desfazer ou refazer.', error);
        snackbarStore.show(text.undoError);
      }
    },
    [dismiss, haptics],
  );

  return { prompt, cancelLabel: text.cancel, choose, dismiss };
}
