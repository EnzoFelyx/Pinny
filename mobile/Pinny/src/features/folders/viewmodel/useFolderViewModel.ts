import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import type { Board } from '@/features/board/model/board.schema';
import { boardRepository } from '@/features/board/model/boardRepository';
import { ptBR } from '@/i18n/pt-BR';
import { normalizeForSearch } from '@/utils/text';

import type { Folder } from '../model/folder.schema';
import { folderRepository } from '../model/folderRepository';
import { toBoardItem } from './useFolderItems';

const text = ptBR.folders;

// Tela da pasta ("+N quadros" na Início): todos os quadros dela, com busca pelo nome. Carrega ao
// abrir e recarrega quando o banco muda (ex.: quadro criado pela folha "Novo quadro").
export function useFolderViewModel(folderId: string) {
  const [data, setData] = useState<{ folder: Folder; boards: Board[] } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isActive = true;
    const reload = () => {
      Promise.all([folderRepository.getById(folderId), boardRepository.listByFolder(folderId)])
        .then(([folder, boards]) => {
          if (!isActive) return;
          // Pasta apagada (ex.: em outra tela): volta para a Início.
          if (!folder) {
            router.back();
            return;
          }
          setData({ folder, boards });
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar a pasta.', error);
          if (isActive) setErrorText(ptBR.common.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [folderId]);

  // Nome editado no título: aparece na hora; se a gravação falhar, o antigo volta.
  const renameFolder = useCallback(
    async (title: string) => {
      if (!data || data.folder.title === title) return;
      setData({ ...data, folder: { ...data.folder, title } });
      try {
        await folderRepository.rename(folderId, title);
      } catch (error: unknown) {
        console.warn('Falha ao renomear a pasta.', error);
        setData(data);
        setErrorText(ptBR.common.saveError);
      }
    },
    [data, folderId],
  );

  const boards = (data?.boards ?? []).map(toBoardItem);
  const search = normalizeForSearch(query);
  const visibleBoards = search
    ? boards.filter((board) => normalizeForSearch(board.title).includes(search))
    : boards;

  const noResults = search.length > 0 && visibleBoards.length === 0;

  return {
    isLoading: data === null && errorText === null,
    errorText,
    title: data?.folder.title ?? '',
    subtitle: text.boardCount(boards.length),
    // Ícone e cor da pasta (selo do topo e miniaturas dos quadros).
    icon: data?.folder.icon ?? 'folder',
    color: data?.folder.color ?? 'lavender',
    query,
    changeQuery: setQuery,
    hasBoards: boards.length > 0,
    boards: visibleBoards,
    noResultsText: noResults ? text.folderScreen.noResults(query) : null,
    createBoardAccessibilityLabel: text.createBoardA11y(data?.folder.title ?? ''),
    renameFolder,
    openBoard: useCallback((boardId: string) => {
      router.push({ pathname: '/board/[boardId]', params: { boardId } });
    }, []),
    // Busca sem resultado: o nome buscado já vem no campo da folha "Novo quadro" (sem criar).
    createBoard: () => {
      const title = noResults ? query.trim() : '';
      router.push({
        pathname: '/folder/[folderId]/new-board',
        params: title ? { folderId, title } : { folderId },
      });
    },
    goBack: router.back,
  };
}
