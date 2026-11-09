import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import type { Folder } from '@/features/folders/model/folder.schema';
import { folderRepository } from '@/features/folders/model/folderRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import type { Board } from '../model/board.schema';
import { moveBoardToFolder } from '../model/boardMove';
import { boardRepository } from '../model/boardRepository';
import type { MoveOption } from './useMoveCardViewModel';

const text = ptBR.board.moveBoardSheet;

// Folha "Mover quadro" (… do quadro): escolhe a pasta e o quadro vai para o fim dela.
// Fixado, chega fixado se a pasta de destino tiver vaga; senão, a folha avisa antes de mover.
export function useMoveBoardViewModel(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  // Pasta que já está no limite de fixados (conferida ao escolher a pasta).
  const [fullFolderId, setFullFolderId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const notifyUndoable = useUndoNotice();

  useEffect(() => {
    let isActive = true;
    Promise.all([boardRepository.getById(boardId), folderRepository.list()])
      .then(([found, allFolders]) => {
        if (!isActive || !found) return;
        setBoard(found);
        setFolders(allFolders);
        setFolderId(found.folderId);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar as pastas.', error);
        if (isActive) setErrorText(text.loadError);
      });
    return () => {
      isActive = false;
    };
  }, [boardId]);

  // Quadro fixado indo para uma pasta já com o limite de fixados: avisa que chega sem fixar.
  const needsPinCheck =
    Boolean(board?.pinnedAt) && folderId !== null && folderId !== board?.folderId;
  useEffect(() => {
    let isActive = true;
    if (!needsPinCheck || !folderId) return;
    boardRepository
      .countPinnedInFolder(folderId)
      .then((pinned) => {
        if (isActive) setFullFolderId(pinned >= PINNED_BOARDS_PER_FOLDER ? folderId : null);
      })
      .catch((error: unknown) => console.warn('Falha ao contar os fixados.', error));
    return () => {
      isActive = false;
    };
  }, [needsPinCheck, folderId]);
  const isTargetFull = needsPinCheck && fullFolderId === folderId;

  const target = folders.find((folder) => folder.id === folderId);
  const canMove = board !== null && target !== undefined && target.id !== board.folderId;

  const move = useCallback(async () => {
    if (!board || !target || target.id === board.folderId) return;
    try {
      const place = await moveBoardToFolder(board.id, target.id, boardRepository);
      if (!place) return;
      historyStore.record(ptBR.history.actions.moveBoard, { kind: 'moveBoard', place });
      // Chegou fixado: a exclusão de um fixado da pasta de destino não pode mais ser desfeita.
      if (board.pinnedAt && !isTargetFull) historyStore.forgetPinnedBoardRestores(target.id);
      router.back();
      await notifyUndoable(ptBR.board.boardMoved(target.title));
    } catch (error: unknown) {
      console.warn('Falha ao mover o quadro.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [board, target, isTargetFull, notifyUndoable]);

  return {
    title: board ? text.title(board.title) : text.loadingTitle,
    folderOptions: folders.map((folder): MoveOption<string> => ({
      value: folder.id,
      label: folder.id === board?.folderId ? text.currentFolder(folder.title) : folder.title,
      isSelected: folder.id === folderId,
    })),
    noticeText: isTargetFull ? text.pinDropped(PINNED_BOARDS_PER_FOLDER) : null,
    errorText,
    canMove,
    selectFolder: setFolderId,
    move,
  };
}
