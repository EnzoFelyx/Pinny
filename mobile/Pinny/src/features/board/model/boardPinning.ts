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

// Ação de fixar do modo "Selecionar" da tela da pasta. Só fixados escolhidos: "Desafixar". Senão,
// "Fixar" os escolhidos que ainda não estão fixados, desde que a pasta continue com no máximo
// PINNED_BOARDS_PER_FOLDER fixados (os já fixados contam). isLimitReached = passaria do limite.
export interface SelectionPinAction {
  kind: 'pin' | 'unpin';
  isEnabled: boolean;
  isLimitReached: boolean;
}

export function selectionPinAction(
  folderBoards: readonly Board[],
  selectedIds: readonly string[],
): SelectionPinAction {
  const selected = folderBoards.filter((board) => selectedIds.includes(board.id));
  if (selected.length > 0 && selected.every((board) => board.pinnedAt !== null)) {
    return { kind: 'unpin', isEnabled: true, isLimitReached: false };
  }
  const pinnedCount = folderBoards.filter((board) => board.pinnedAt !== null).length;
  const newPins = selected.filter((board) => board.pinnedAt === null).length;
  const fits = pinnedCount + newPins <= PINNED_BOARDS_PER_FOLDER;
  return { kind: 'pin', isEnabled: newPins > 0 && fits, isLimitReached: newPins > 0 && !fits };
}

// Fixa os quadros na ordem dada (o primeiro aparece primeiro na Início). Quem já está fixado
// mantém a data. Quem chama confere o limite (selectionPinAction).
export async function pinBoards(
  folderBoards: readonly Board[],
  boardIds: readonly string[],
  boards: BoardRepository,
): Promise<void> {
  const toPin = boardIds.filter((id) =>
    folderBoards.some((board) => board.id === id && board.pinnedAt === null),
  );
  const now = Date.now();
  for (const [order, boardId] of toPin.entries()) {
    // Datas em ordem decrescente: o primeiro escolhido fica como o "mais recente".
    await boards.setPinnedAt(boardId, new Date(now - order).toISOString());
  }
}

export async function unpinBoards(
  boardIds: readonly string[],
  boards: BoardRepository,
): Promise<void> {
  for (const boardId of boardIds) {
    await boards.setPinnedAt(boardId, null);
  }
}
