import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { columnRepository } from '../model/columnRepository';

// Folha "Nova coluna", aberta pela coluna "Adicionar coluna" no fim do quadro. A coluna entra no
// fim do quadro e no histórico (chacoalhar desfaz); o quadro recarrega sozinho e rola até ela.
export function useNewColumnViewModel(boardId: string) {
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const create = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      const column = await columnRepository.create(boardId, title);
      historyStore.record(ptBR.history.actions.createColumn, {
        kind: 'deleteColumn',
        columnId: column.id,
      });
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao criar a coluna.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [boardId, name]);

  return {
    name,
    errorText,
    canCreate: name.trim().length > 0,
    changeName: setName,
    create,
  };
}
