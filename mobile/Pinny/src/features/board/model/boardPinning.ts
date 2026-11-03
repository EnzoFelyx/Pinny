import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import { nowIso } from '@/utils/time';

import type { Board } from './board.schema';
import type { BoardRepository } from './boardRepository';

export type BoardPinToggleResult = 'pinned' | 'unpinned' | 'limitReached' | 'notFound';

// Fixa o quadro na Início (entre os que a pasta mostra) ou desafixa, se já estiver fixado. No
// máximo PINNED_BOARDS_PER_FOLDER fixados por pasta: além disso, nada muda.
export async function togglePinnedBoard(
  boardId: string,
  boards: BoardRepository,
): Promise<BoardPinToggleResult> {
  const board = await boards.getById(boardId);
  if (!board) return 'notFound';
  if (board.pinnedAt) {
    await boards.setPinnedAt(boardId, null);
    return 'unpinned';
  }
  if ((await boards.countPinnedInFolder(board.folderId)) >= PINNED_BOARDS_PER_FOLDER) {
    return 'limitReached';
  }
  await boards.setPinnedAt(boardId, nowIso());
  return 'pinned';
}

// Ordem da prévia da pasta na Início: os fixados primeiro (do mais recente para o mais antigo) e
// depois os outros, na ordem da pasta. Sem alterar a lista recebida.
export function orderForPreview(boards: readonly Board[]): Board[] {
  const pinned = boards
    .filter((board) => board.pinnedAt !== null)
    .sort((a, b) => (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? ''));
  return [...pinned, ...boards.filter((board) => board.pinnedAt === null)];
}

// Modo "Fixar quadros" da tela da pasta: deixa fixados exatamente os escolhidos (até
// PINNED_BOARDS_PER_FOLDER), na ordem da escolha (o primeiro escolhido aparece primeiro na Início).
// Quem já estava fixado e continua escolhido mantém a data; os desmarcados são desafixados.
export async function applyPinnedBoards(
  folderBoards: readonly Board[],
  selectedIds: readonly string[],
  boards: BoardRepository,
): Promise<void> {
  const chosen = selectedIds.slice(0, PINNED_BOARDS_PER_FOLDER);
  const now = Date.now();
  for (const board of folderBoards) {
    const order = chosen.indexOf(board.id);
    if (order < 0) {
      if (board.pinnedAt !== null) await boards.setPinnedAt(board.id, null);
    } else if (board.pinnedAt === null) {
      // Datas em ordem decrescente: o primeiro escolhido fica como o "mais recente".
      await boards.setPinnedAt(board.id, new Date(now - order).toISOString());
    }
  }
}
