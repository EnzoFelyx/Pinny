import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ptBR } from '@/i18n/pt-BR';
import { formatWeekdayAndDate } from '@/utils/date';

import { toFolderItem, useFolderItems } from './useFolderItems';

const text = ptBR.folders;
// Provisório: o nome virá da primeira abertura do app, guardado só no aparelho.
const USER_NAME = 'Enzo';

function noop() {}

export function useHomeViewModel() {
  // "+" depois dos quadros da pasta, "Criar o primeiro quadro" e "Novo quadro" do "⋮": folha
  // "Novo quadro".
  const createBoard = useCallback((folderId: string) => {
    router.push({ pathname: '/folder/[folderId]/new-board', params: { folderId } });
  }, []);
  const folderActions = useMemo(
    () => ({
      customize: (folderId: string) => {
        router.push({ pathname: '/folder/[folderId]/rename', params: { folderId } });
      },
      createBoard,
      pin: noop,
      delete: noop,
    }),
    [createBoard],
  );
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
    // "⋮" da pasta. Personalizar abre, por enquanto, a folha de renomear (cor e ícone chegam na
    // etapa 8); Fixar no topo e Apagar ainda não fazem nada.
    folderActions,
    // "+N quadros": abre a tela da pasta, com todos os quadros.
    openFolder: useCallback((folderId: string) => {
      router.push({ pathname: '/folder/[folderId]', params: { folderId } });
    }, []),
    createBoard,
  };
}
