import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { ptBR } from '@/i18n/pt-BR';

import { folderRepository } from '../model/folderRepository';

// Folha "Nova pasta", aberta pelo "+" do topo da Início. Ícone e cor serão escolhidos aqui na etapa 8.
export function useNewFolderViewModel() {
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const create = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      await folderRepository.create({ title });
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao criar a pasta.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [name]);

  return {
    name,
    errorText,
    canCreate: name.trim().length > 0,
    changeName: setName,
    create,
  };
}
