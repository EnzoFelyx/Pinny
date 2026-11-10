import { useCallback } from 'react';

import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { ptBR } from '@/i18n/pt-BR';

import { historyStore } from '../model/historyStore';

// Botão "Desfazer" do snackbar (para quem desligou o "Agitar para Desfazer"): desfaz direto,
// sem alerta, como um botão "Desfazer" do iOS.
export function useUndoLast() {
  return useCallback(async () => {
    try {
      await historyStore.undoLast();
      snackbarStore.hide();
    } catch (error: unknown) {
      console.warn('Falha ao desfazer.', error);
      snackbarStore.show(ptBR.history.undoError);
    }
  }, []);
}
