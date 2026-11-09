import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import type { LabelColor } from '@/features/card/model/card.types';
import type { Board } from '@/features/board/model/board.schema';
import { orderForPreview } from '@/features/board/model/boardPinning';
import { HOME_PREVIEW_BOARDS } from '@/constants/limits';
import { ptBR } from '@/i18n/pt-BR';

import type { FolderIcon } from '../model/folder.schema';
import { type FolderWithBoards, loadFoldersWithBoards } from '../model/homeData';

const text = ptBR.folders;

export interface HomeBoardItem {
  id: string;
  title: string;
  accessibilityLabel: string;
  // Fixado na Início: alfinete ao lado do nome e o fundo lavanda de destaque.
  isPinned: boolean;
  // Tela da pasta: "Fixar na Início"/"Desafixar" ao segurar (null = sem a opção: já há 3 fixados).
  pinActionLabel: string | null;
}

export interface HomeFolderItem {
  id: string;
  title: string;
  icon: FolderIcon;
  color: LabelColor;
  boardCountText: string;
  accessibilityLabel: string;
  optionsAccessibilityLabel: string;
  // Fixada no topo da Início: alfinete ao lado do nome e "Desafixar" no menu.
  isPinned: boolean;
  pinActionLabel: string;
  // Mostra "Fixar no topo"/"Desafixar" no menu: some o "Fixar" quando já há 3 fixadas.
  canTogglePin: boolean;
  createBoardAccessibilityLabel: string;
  // Texto do "+" quando a pasta está vazia (null = ela já tem quadros).
  createFirstBoardText: string | null;
  emptyText: string | null;
  boards: HomeBoardItem[];
  // Na Início: os primeiros quadros e, se houver mais, o link para a tela da pasta.
  previewBoards: HomeBoardItem[];
  // Há quadros fora da Início: a última vaga vira "Ver todos ›".
  hasMoreBoards: boolean;
  seeAllAccessibilityLabel: string;
}

export function toBoardItem(board: Board, pinActionLabel: string | null = null): HomeBoardItem {
  const isPinned = board.pinnedAt !== null;
  return {
    id: board.id,
    title: board.title,
    accessibilityLabel: text.openBoardA11y(board.title, isPinned),
    isPinned,
    pinActionLabel,
  };
}

interface FolderItemOptions {
  // Ainda cabe mais uma pasta fixada (PINNED_FOLDERS_LIMIT).
  canPinMore?: boolean;
}

export function toFolderItem(
  { folder, boards }: FolderWithBoards,
  { canPinMore = false }: FolderItemOptions = {},
): HomeFolderItem {
  const boardItems = boards.map((board) => toBoardItem(board));
  // Na Início, os fixados vêm primeiro e a pasta completa com os outros.
  const previewItems = orderForPreview(boards).map((board) => toBoardItem(board));
  return {
    id: folder.id,
    title: folder.title,
    icon: folder.icon,
    color: folder.color,
    boardCountText: text.boardCount(boards.length),
    accessibilityLabel: text.folderSummary(folder.title, boards.length, folder.pinnedAt !== null),
    optionsAccessibilityLabel: text.folderOptionsA11y(folder.title),
    isPinned: folder.pinnedAt !== null,
    pinActionLabel: folder.pinnedAt !== null ? text.folderMenu.unpin : text.folderMenu.pin,
    canTogglePin: folder.pinnedAt !== null || canPinMore,
    createBoardAccessibilityLabel: text.createBoardA11y(folder.title),
    createFirstBoardText: boards.length === 0 ? text.createFirstBoard : null,
    emptyText: boards.length === 0 ? text.emptyFolder : null,
    boards: boardItems,
    previewBoards: previewItems.slice(0, HOME_PREVIEW_BOARDS),
    hasMoreBoards: boards.length > HOME_PREVIEW_BOARDS,
    seeAllAccessibilityLabel: text.moreBoardsA11y(folder.title, boards.length),
  };
}

// Pastas com seus quadros, compartilhadas pela Início e pela busca. Carrega ao abrir e
// recarrega a cada mudança no banco (ex.: pasta criada pelo "+").
export function useFolderItems() {
  const [items, setItems] = useState<FolderWithBoards[]>([]);
  const [loadErrorText, setLoadErrorText] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadFoldersWithBoards()
        .then((result) => {
          if (!isActive) return;
          setItems(result);
          setLoadErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar as pastas.', error);
          if (isActive) setLoadErrorText(ptBR.common.loadError);
        });
    };

    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const openBoard = useCallback((boardId: string) => {
    router.push({ pathname: '/board/[boardId]', params: { boardId } });
  }, []);

  return { items, loadErrorText, openBoard };
}
