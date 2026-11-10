import { useCallback } from 'react';

import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { preferencesRepository } from '@/features/settings/model/preferencesRepository';
import { ptBR } from '@/i18n/pt-BR';

import { decideUndoNotice } from '../model/undoNotice';
import { useShakeAvailability } from './useShakeAvailability';
import { useUndoLast } from './useUndoLast';

// Aviso depois de uma ação que dá para desfazer (ex.: mover cartão). Na primeira vez, ensina o
// chacoalhar; quem não pode chacoalhar recebe sempre o botão "Desfazer".
export function useUndoNotice() {
  const canShake = useShakeAvailability();
  const undoLast = useUndoLast();

  return useCallback(
    async (description: string) => {
      // Ainda verificando o chacoalhar: melhor não mostrar nada do que mostrar o aviso errado.
      if (canShake === null) return;
      try {
        const hasSeenHint = await preferencesRepository.getFlag('shakeHintSeen');
        const notice = decideUndoNotice(canShake, hasSeenHint);
        if (notice === 'shakeHint') {
          snackbarStore.show(ptBR.history.shakeHint, { icon: 'shake' });
          await preferencesRepository.setFlag('shakeHintSeen', true);
        } else if (notice === 'undoButton') {
          snackbarStore.show(description, {
            action: { label: ptBR.common.undo, onPress: undoLast },
          });
        }
      } catch (error: unknown) {
        console.warn('Falha ao mostrar o aviso de desfazer.', error);
      }
    },
    [canShake, undoLast],
  );
}
