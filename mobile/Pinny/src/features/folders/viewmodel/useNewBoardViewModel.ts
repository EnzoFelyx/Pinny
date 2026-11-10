import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { createBoardWithColumns } from '@/features/board/model/boardCreation';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { ptBR } from '@/i18n/pt-BR';

import { folderRepository } from '../model/folderRepository';

const text = ptBR.folders.newBoard;
const repositories = { boards: boardRepository, columns: columnRepository };

// Folha "Novo quadro", aberta pelo "+" da pasta na Início. O quadro entra no fim da pasta, já com
// as colunas "Pendentes" e "Concluídas" (vazias), e abre em seguida; a Início recarrega sozinha
// quando o banco muda.
// initialTitle (busca sem resultado na tela da pasta) só preenche o campo: nada é criado sem o
// toque em "Criar quadro".
export function useNewBoardViewModel(folderId: string, initialTitle = '') {
  const [name, setName] = useState(initialTitle);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [folderTitle, setFolderTitle] = useState<string | null>(null);

  // Nome da pasta para o aviso da folha: deixa claro onde o quadro vai ficar.
  useEffect(() => {
    let isActive = true;
    folderRepository
      .getById(folderId)
      .then((folder) => {
        if (isActive) setFolderTitle(folder?.title ?? null);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar a pasta.', error);
      });
    return () => {
      isActive = false;
    };
  }, [folderId]);

  const create = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      const board = await createBoardWithColumns(
        folderId,
        title,
        text.defaultColumns,
        repositories,
      );
      router.back();
      router.push({ pathname: '/board/[boardId]', params: { boardId: board.id } });
    } catch (error: unknown) {
      console.warn('Falha ao criar o quadro.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [folderId, name]);

  return {
    name,
    errorText,
    folderNotice: folderTitle ? text.folderNotice(folderTitle) : undefined,
    canCreate: name.trim().length > 0,
    changeName: setName,
    create,
  };
}
