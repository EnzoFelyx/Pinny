import type { Board } from '@/features/board/model/board.schema';
import { type BoardRepository, boardRepository } from '@/features/board/model/boardRepository';
import { normalizeForSearch } from '@/utils/text';

import type { Folder } from './folder.schema';
import { type FolderRepository, folderRepository } from './folderRepository';

export interface FolderWithBoards {
  folder: Folder;
  boards: Board[];
}

interface HomeRepositories {
  folders: FolderRepository;
  boards: BoardRepository;
}

export async function loadFoldersWithBoards(
  repositories: HomeRepositories = { folders: folderRepository, boards: boardRepository },
): Promise<FolderWithBoards[]> {
  const folders = await repositories.folders.list();
  return Promise.all(
    folders.map(async (folder) => ({
      folder,
      boards: await repositories.boards.listByFolder(folder.id),
    })),
  );
}

// Busca da tela Início: a pasta aparece se o nome dela bate (com todos os quadros)
// ou se algum quadro bate (só com esses quadros). Sem diferenciar acentos.
export function filterFoldersByQuery(
  items: readonly FolderWithBoards[],
  query: string,
): FolderWithBoards[] {
  const term = normalizeForSearch(query);
  if (!term) return [...items];

  return items.flatMap((item) => {
    if (normalizeForSearch(item.folder.title).includes(term)) return [item];
    const boards = item.boards.filter((board) => normalizeForSearch(board.title).includes(term));
    return boards.length > 0 ? [{ folder: item.folder, boards }] : [];
  });
}
