import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import type { Folder } from '@/features/folders/model/folder.schema';
import { folderRepository } from '@/features/folders/model/folderRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { useUndoNotice } from '@/features/history/viewmodel/useUndoNotice';
import { ptBR } from '@/i18n/pt-BR';

import type { Board, Column } from '../model/board.schema';
import { boardRepository } from '../model/boardRepository';
import { moveCards } from '../model/cardBatch';
import { columnRepository } from '../model/columnRepository';
import { labelRepository } from '../model/labelRepository';
import { cardsMovedSignal } from './cardsMovedSignal';
import type { MoveOption } from './useMoveCardViewModel';

const text = ptBR.board.moveCardsSheet;

interface FolderBoards {
  folder: Folder;
  boards: Board[];
}

export interface BoardGroup {
  // Id da pasta: chave da lista (duas pastas podem ter o mesmo nome).
  id: string;
  title: string;
  options: MoveOption<string>[];
}

// Folha "Mover cartões" (barra do modo de seleção), como o "Mover" do Mail: abre nas colunas do
// quadro atual e "Trocar" leva à lista de quadros, por pasta. Os cartões vão para o fim da coluna.
export function useMoveCardsViewModel(boardId: string, cardIds: readonly string[]) {
  const [groups, setGroups] = useState<FolderBoards[]>([]);
  const [targetBoardId, setTargetBoardId] = useState(boardId);
  const [isPickingBoard, setIsPickingBoard] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnId, setColumnId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const notifyUndoable = useUndoNotice();

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      const folders = await folderRepository.list();
      const loaded = await Promise.all(
        folders.map(async (folder) => ({
          folder,
          boards: await boardRepository.listByFolder(folder.id),
        })),
      );
      if (isActive) setGroups(loaded.filter((group) => group.boards.length > 0));
    };
    load().catch((error: unknown) => {
      console.warn('Falha ao carregar os quadros.', error);
      if (isActive) setErrorText(text.loadError);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Colunas do quadro escolhido (troca junto com o quadro).
  useEffect(() => {
    let isActive = true;
    columnRepository
      .listByBoard(targetBoardId)
      .then((found) => {
        if (isActive) setColumns(found);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar as colunas.', error);
        if (isActive) setErrorText(text.loadError);
      });
    return () => {
      isActive = false;
    };
  }, [targetBoardId]);

  const selectBoard = useCallback((id: string) => {
    setTargetBoardId(id);
    setColumnId(null);
    setIsPickingBoard(false);
  }, []);

  const target = columns.find((column) => column.id === columnId);
  const targetBoard = groups.flatMap((group) => group.boards).find((b) => b.id === targetBoardId);

  const move = useCallback(async () => {
    if (!target) return;
    try {
      const undo = await moveCards(
        cardIds,
        { columnId: target.id, toBoardId: targetBoardId === boardId ? null : targetBoardId },
        { cards: cardRepository, labels: labelRepository },
      );
      historyStore.record(ptBR.history.actions.moveCards, undo);
      cardsMovedSignal.emit();
      router.back();
      await notifyUndoable(ptBR.board.selection.cardsMoved(cardIds.length, target.title));
    } catch (error: unknown) {
      console.warn('Falha ao mover os cartões.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [target, cardIds, targetBoardId, boardId, notifyUndoable]);

  const boardTitleOf = (board: Board) =>
    board.id === boardId ? text.currentBoard(board.title) : board.title;

  return {
    title: text.title(cardIds.length),
    isPickingBoard,
    boardTitle: targetBoard ? boardTitleOf(targetBoard) : '',
    boardGroups: groups.map(({ folder, boards }): BoardGroup => ({
      id: folder.id,
      title: folder.title,
      options: boards.map((board) => ({
        value: board.id,
        label: boardTitleOf(board),
        isSelected: board.id === targetBoardId,
      })),
    })),
    columnOptions: columns.map((column): MoveOption<string> => ({
      value: column.id,
      label: column.title,
      isSelected: column.id === columnId,
    })),
    errorText,
    canMove: target !== undefined && !isPickingBoard,
    startPickingBoard: () => setIsPickingBoard(true),
    selectBoard,
    selectColumn: setColumnId,
    move,
  };
}
