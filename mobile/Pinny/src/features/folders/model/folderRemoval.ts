import { PINNED_FOLDERS_LIMIT } from '@/constants/limits';
import {
  type BoardRemovalRepositories,
  type BoardSnapshot,
  removeBoardWithContent,
  restoreBoardWithContent,
} from '@/features/board/model/boardRemoval';

import type { Folder } from './folder.schema';
import type { FolderRepository } from './folderRepository';

// Retrato de uma pasta apagada: ela e cada quadro com tudo o que tem dentro, para o "Desfazer".
export interface FolderSnapshot {
  folder: Folder;
  boards: BoardSnapshot[];
}

export interface FolderRemovalRepositories extends BoardRemovalRepositories {
  folders: FolderRepository;
}

// Apaga a pasta com os quadros, as colunas, os cartões (inclusive arquivados) e as etiquetas,
// devolvendo o retrato. null = a pasta não existe mais.
export async function removeFolderWithContent(
  folderId: string,
  repositories: FolderRemovalRepositories,
): Promise<FolderSnapshot | null> {
  const folder = await repositories.folders.getById(folderId);
  if (!folder) return null;
  const boards = await repositories.boards.listByFolder(folderId);
  const snapshots: BoardSnapshot[] = [];
  for (const board of boards) {
    const snapshot = await removeBoardWithContent(board.id, repositories);
    if (snapshot) snapshots.push(snapshot);
  }
  await repositories.folders.remove(folderId);
  return { folder, boards: snapshots };
}

// Recria a pasta exatamente como era (mesmos ids, nomes e posições). Se ela estava fixada e
// outras 3 já foram fixadas nesse meio-tempo, volta sem fixar (a Início nunca passa de 3).
export async function restoreFolderWithContent(
  { folder, boards }: FolderSnapshot,
  repositories: FolderRemovalRepositories,
): Promise<void> {
  const isFull =
    folder.pinnedAt !== null && (await repositories.folders.countPinned()) >= PINNED_FOLDERS_LIMIT;
  await repositories.folders.restore(isFull ? { ...folder, pinnedAt: null } : folder);
  for (const snapshot of boards) {
    await restoreBoardWithContent(snapshot, repositories);
  }
}
