import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ptBR } from '@/i18n/pt-BR';

import { folderRepository } from '../model/folderRepository';

// Folha "Renomear pasta", aberta pelo lápis de cada pasta na Início.
export function useRenameFolderViewModel(folderId: string) {
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    folderRepository
      .getById(folderId)
      .then((folder) => {
        if (isActive && folder) setName(folder.title);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar a pasta.', error);
        if (isActive) setErrorText(ptBR.common.loadError);
      });
    return () => {
      isActive = false;
    };
  }, [folderId]);

  const save = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      await folderRepository.rename(folderId, title);
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao renomear a pasta.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [folderId, name]);

  return {
    name,
    errorText,
    canSave: name.trim().length > 0,
    changeName: setName,
    save,
  };
}
