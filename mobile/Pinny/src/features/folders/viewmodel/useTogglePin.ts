import { useCallback } from 'react';

import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { ptBR } from '@/i18n/pt-BR';

import { togglePinnedFolder } from '../model/folderPinning';
import { folderRepository } from '../model/folderRepository';

// "Fixar no topo" / "Desafixar" (Início e tela da pasta). Com 3 fixadas, o "Fixar" nem aparece
// no menu (o modelo também não fixa a quarta). As telas recarregam sozinhas quando o banco muda.
export function useTogglePin() {
  return useCallback(async (folderId: string) => {
    try {
      await togglePinnedFolder(folderId, folderRepository);
    } catch (error: unknown) {
      console.warn('Falha ao fixar a pasta.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, []);
}
