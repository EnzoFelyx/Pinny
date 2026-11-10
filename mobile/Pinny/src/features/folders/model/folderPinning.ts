import { PINNED_FOLDERS_LIMIT } from '@/constants/limits';
import { nowIso } from '@/utils/time';

import type { FolderRepository } from './folderRepository';

export type PinToggleResult = 'pinned' | 'unpinned' | 'limitReached' | 'notFound';

// Fixa a pasta no topo da Início (a mais recente fica em primeiro) ou desafixa, se já estiver
// fixada. No máximo PINNED_FOLDERS_LIMIT fixadas: além disso, nada muda.
export async function togglePinnedFolder(
  folderId: string,
  folders: FolderRepository,
): Promise<PinToggleResult> {
  const folder = await folders.getById(folderId);
  if (!folder) return 'notFound';
  if (folder.pinnedAt) {
    await folders.setPinnedAt(folderId, null);
    return 'unpinned';
  }
  if ((await folders.countPinned()) >= PINNED_FOLDERS_LIMIT) return 'limitReached';
  await folders.setPinnedAt(folderId, nowIso());
  return 'pinned';
}
