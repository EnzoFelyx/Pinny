import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import type { Board } from '@/features/board/model/board.schema';
import { boardRepository } from '@/features/board/model/boardRepository';
import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import { orderForPreview, togglePinnedBoard } from '@/features/board/model/boardPinning';
import { useDeleteBoard } from '@/features/board/viewmodel/useDeleteBoard';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';
import { normalizeForSearch } from '@/utils/text';

import type { Folder } from '../model/folder.schema';
import { folderRepository } from '../model/folderRepository';
import { useBoardSelection } from './useBoardSelection';
import { useDeleteFolder } from './useDeleteFolder';
import { toBoardItem } from './useFolderItems';

const text = ptBR.folders;

// Tela da pasta ("+N quadros" na Início): todos os quadros dela, com busca pelo nome. Carrega ao
// abrir e recarrega quando o banco muda (ex.: quadro criado pela folha "Novo quadro").
export function useFolderViewModel(folderId: string) {
  const [data, setData] = useState<{
    folder: Folder;
    boards: Board[];
  } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // A tela já voltou para a Início ao apagar a pasta: a recarga não volta de novo.
  const isLeavingRef = useRef(false);

  useEffect(() => {
    let isActive = true;
    const reload = () => {
      Promise.all([folderRepository.getById(folderId), boardRepository.listByFolder(folderId)])
        .then(([folder, boards]) => {
          if (!isActive) return;
          // Pasta apagada (ex.: em outra tela): volta para a Início.
          if (!folder) {
            if (!isLeavingRef.current) router.back();
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

  // "Apagar" do "…": ao confirmar, volta para a Início antes de apagar.
  const deleteFolder = useDeleteFolder({
    onConfirmed: () => {
      isLeavingRef.current = true;
      router.back();
    },
  });

  const requestFolderDelete = deleteFolder.request;

  const folderBoards = useMemo(() => data?.boards ?? [], [data]);
  const deleteBoard = useDeleteBoard(folderBoards);
  const requestDeleteBoard = deleteBoard.request;
  const selection = useBoardSelection(folderId, folderBoards, requestDeleteBoard);
  const exitSelection = selection.cancel;
  const confirmDelete = deleteBoard.confirm;
  // Excluir pelo modo "Selecionar": ao confirmar, a seleção acaba (cancelar o alerta a mantém).
  const confirmDeleteBoard = useCallback(() => {
    exitSelection();
    return confirmDelete();
  }, [exitSelection, confirmDelete]);
  const boardMenu = useMemo(
    () => ({
      onTogglePin: (boardId: string) => {
        togglePinnedBoard(boardId, boardRepository)
          .then((result) => {
            if (result === 'pinned') historyStore.forgetPinnedBoardRestores(folderId);
          })
          .catch((error: unknown) => {
            console.warn('Falha ao fixar o quadro.', error);
            snackbarStore.show(ptBR.common.saveError);
          });
      },
      onDelete: (boardId: string) => requestDeleteBoard([boardId]),
    }),
    [folderId, requestDeleteBoard],
  );

  // Segurar o quadro: "Fixar na Início" (até 3 por pasta; com 3, a opção some e fica só o
  // "Excluir quadro") ou "Desafixar".
  const pinnedBoardCount = (data?.boards ?? []).filter((board) => board.pinnedAt !== null).length;
  const canPinMoreBoards = pinnedBoardCount < PINNED_BOARDS_PER_FOLDER;
  // Os fixados na Início vêm primeiro (como na prévia da Início); depois, os outros na ordem da
  // pasta.
  const boards = orderForPreview(folderBoards).map((board) =>
    toBoardItem(
      board,
      board.pinnedAt !== null ? text.unpinBoard : canPinMoreBoards ? text.pinBoard : null,
    ),
  );
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
    // Tocar no nome ou "Personalizar" no "…": por enquanto, a folha de renomear (cor e ícone
    // chegam na etapa 8).
    customizeFolder: useCallback(() => {
      router.push({ pathname: '/folder/[folderId]/rename', params: { folderId } });
    }, [folderId]),
    selection,
    // Segurar o quadro: fixar/desafixar e "Excluir quadro" (alerta de confirmação e desfazer).
    boardMenu,
    deleteBoardRequest: deleteBoard.confirmRequest,
    confirmDeleteBoard,
    cancelDeleteBoard: deleteBoard.cancel,
    requestDeleteFolder: useCallback(
      () => requestFolderDelete(folderId),
      [requestFolderDelete, folderId],
    ),
    deleteFolderRequest: deleteFolder.confirmRequest,
    confirmDeleteFolder: deleteFolder.confirm,
    cancelDeleteFolder: deleteFolder.cancel,
    goBack: router.back,
  };
}
