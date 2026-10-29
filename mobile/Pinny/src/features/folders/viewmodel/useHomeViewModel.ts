import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ptBR } from '@/i18n/pt-BR';
import { formatWeekdayAndDate } from '@/utils/date';

import { toFolderItem, useFolderItems } from './useFolderItems';

const text = ptBR.folders;
// Provisório: o nome virá da primeira abertura do app, guardado só no aparelho.
const USER_NAME = 'Enzo';

export function useHomeViewModel() {
  const { items, loadErrorText, openBoard } = useFolderItems();
  const folders = useMemo(() => items.map(toFolderItem), [items]);

  return {
    dateText: formatWeekdayAndDate(new Date()),
    greeting: text.greeting(USER_NAME),
    folderCountText: text.folderCount(items.length),
    folders,
    errorText: loadErrorText,
    emptyText: items.length === 0 ? text.empty : null,
    openBoard,
    // As folhas são rotas com apresentação nativa ("formSheet", ver app/_layout.tsx).
    createFolder: useCallback(() => router.push('/folder/new'), []),
    renameFolder: useCallback((folderId: string) => {
      router.push({ pathname: '/folder/[folderId]/rename', params: { folderId } });
    }, []),
  };
}
