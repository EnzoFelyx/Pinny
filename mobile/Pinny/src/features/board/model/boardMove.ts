import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';

import type { BoardRepository } from './boardRepository';

// Onde o quadro estava: o que o "Desfazer" precisa para devolvê-lo.
export interface BoardPlace {
  boardId: string;
  folderId: string;
  position: number;
  pinnedAt: string | null;
}

// Mantém a fixação só se a pasta de destino ainda tiver vaga (no máximo PINNED_BOARDS_PER_FOLDER).
async function keepPinIfFits(
  boardId: string,
  folderId: string,
  pinnedAt: string | null,
  boards: BoardRepository,
): Promise<void> {
  const fits = (await boards.countPinnedInFolder(folderId)) < PINNED_BOARDS_PER_FOLDER;
  await boards.setPinnedAt(boardId, pinnedAt !== null && fits ? pinnedAt : null);
}

// "Mover para outra pasta": o quadro vai para o fim da pasta escolhida. Fixado, continua fixado
// se a pasta de destino tiver vaga; senão, chega desafixado. Devolve onde ele estava.
// null = o quadro não existe mais.
export async function moveBoardToFolder(
  boardId: string,
  folderId: string,
  boards: BoardRepository,
): Promise<BoardPlace | null> {
  const before = await boards.getById(boardId);
  if (!before) return null;
  // Desafixa antes de contar, para o próprio quadro não ocupar a vaga.
  await boards.setPinnedAt(boardId, null);
  await boards.move(boardId, folderId, {});
  await keepPinIfFits(boardId, folderId, before.pinnedAt, boards);
  return {
    boardId,
    folderId: before.folderId,
    position: before.position,
    pinnedAt: before.pinnedAt,
  };
}

// Devolve o quadro à pasta, à posição e à fixação de antes (se a pasta ainda tiver vaga).
// Devolve onde ele estava antes disso (para refazer). null = o quadro não existe mais.
export async function restoreBoardPlace(
  place: BoardPlace,
  boards: BoardRepository,
): Promise<BoardPlace | null> {
  const before = await boards.getById(place.boardId);
  if (!before) return null;
  await boards.setPinnedAt(place.boardId, null);
  await boards.moveToPosition(place.boardId, place.folderId, place.position);
  await keepPinIfFits(place.boardId, place.folderId, place.pinnedAt, boards);
  return {
    boardId: before.id,
    folderId: before.folderId,
    position: before.position,
    pinnedAt: before.pinnedAt,
  };
}
