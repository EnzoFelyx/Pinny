import { useCallback, useMemo } from 'react';

import { PINNED_FOLDERS_LIMIT } from '@/constants/limits';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';
import { formatWeekdayAndDate } from '@/utils/date';

import { toFolderItem, useFolderItems } from './useFolderItems';
import { useDeleteFolder } from './useDeleteFolder';
import { useTogglePin } from './useTogglePin';

const text = ptBR.folders;
// Provisório: o nome virá da primeira abertura do app, guardado só no aparelho.
const USER_NAME = 'Enzo';

export function useHomeViewModel() {
  // "+" depois dos quadros da pasta, "Criar o primeiro quadro" e "Novo quadro" do "⋮": folha
  // "Novo quadro".
  const createBoard = useCallback((folderId: string) => {
    openRoute({ pathname: '/folder/[folderId]/new-board', params: { folderId } });
  }, []);
  const togglePin = useTogglePin();
  const deleteFolder = useDeleteFolder();
  const folderActions = useMemo(
    () => ({
      customize: (folderId: string) => {
        openRoute({ pathname: '/folder/[folderId]/rename', params: { folderId } });
      },
      createBoard,
      pin: togglePin,
      delete: deleteFolder.request,
    }),
    [createBoard, togglePin, deleteFolder.request],
  );
  const { items, loadErrorText, openBoard } = useFolderItems();
  const folders = useMemo(() => {
    const canPinMore =
      items.filter((item) => item.folder.pinnedAt !== null).length < PINNED_FOLDERS_LIMIT;
    return items.map((item) => toFolderItem(item, { canPinMore }));
  }, [items]);

  return {
    dateText: formatWeekdayAndDate(new Date()),
    greeting: text.greeting(USER_NAME),
    folderCountText: text.folderCount(items.length),
    folders,
    errorText: loadErrorText,
    emptyText: items.length === 0 ? text.empty : null,
    openBoard,
    // As folhas são rotas com apresentação nativa ("formSheet", ver app/_layout.tsx).
    createFolder: useCallback(() => openRoute('/folder/new'), []),
    // "⋮" da pasta. Personalizar abre, por enquanto, a folha de renomear (cor e ícone chegam na
    // etapa 8); Fixar no topo / Desafixar e Apagar (alerta e desfazer).
    folderActions,
    deleteFolderRequest: deleteFolder.confirmRequest,
    confirmDeleteFolder: deleteFolder.confirm,
    cancelDeleteFolder: deleteFolder.cancel,
    // "+N quadros": abre a tela da pasta, com todos os quadros.
    openFolder: useCallback((folderId: string) => {
      openRoute({ pathname: '/folder/[folderId]', params: { folderId } });
    }, []),
    createBoard,
  };
}
