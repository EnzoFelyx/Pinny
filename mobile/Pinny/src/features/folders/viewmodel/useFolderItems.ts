import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import type { LabelColor } from '@/features/card/model/card.types';
import { ptBR } from '@/i18n/pt-BR';

import type { FolderIcon } from '../model/folder.schema';
import { type FolderWithBoards, loadFoldersWithBoards } from '../model/homeData';

const text = ptBR.folders;

export interface HomeBoardItem {
  id: string;
  title: string;
  accessibilityLabel: string;
  // O primeiro quadro de cada pasta ganha o fundo de destaque (como no Figma).
  isHighlighted: boolean;
}

export interface HomeFolderItem {
  id: string;
  title: string;
  icon: FolderIcon;
  color: LabelColor;
  boardCountText: string;
  accessibilityLabel: string;
  renameAccessibilityLabel: string;
  emptyText: string | null;
  boards: HomeBoardItem[];
}

export function toFolderItem({ folder, boards }: FolderWithBoards): HomeFolderItem {
  return {
    id: folder.id,
    title: folder.title,
    icon: folder.icon,
    color: folder.color,
    boardCountText: text.boardCount(boards.length),
    accessibilityLabel: text.folderSummary(folder.title, boards.length),
    renameAccessibilityLabel: text.renameFolderA11y(folder.title),
    emptyText: boards.length === 0 ? text.emptyFolder : null,
    boards: boards.map((board, index) => ({
      id: board.id,
      title: board.title,
      accessibilityLabel: text.openBoardA11y(board.title),
      isHighlighted: index === 0,
    })),
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
