import { useCallback, useState } from 'react';

import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import type { Board } from '@/features/board/model/board.schema';
import { applyPinnedBoards } from '@/features/board/model/boardPinning';
import { boardRepository } from '@/features/board/model/boardRepository';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

// Modo "Fixar quadros" da tela da pasta, como a seleção de fotos do iOS: começa com os já fixados
// marcados, cada toque marca ou desmarca (até 3) e "Pronto" grava a escolha. "Cancelar" descarta.
export function usePinSelection(folderBoards: readonly Board[]) {
  // null = fora do modo de seleção.
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const isSelecting = selectedIds !== null;

  const start = useCallback(() => {
    const pinned = folderBoards
      .filter((board) => board.pinnedAt !== null)
      .sort((a, b) => (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? ''))
      .map((board) => board.id);
    setSelectedIds(pinned);
  }, [folderBoards]);

  const toggle = useCallback((boardId: string) => {
    setSelectedIds((current) => {
      if (!current) return current;
      if (current.includes(boardId)) return current.filter((id) => id !== boardId);
      // Já com 3 escolhidos, o toque num quarto não faz nada.
      return current.length >= PINNED_BOARDS_PER_FOLDER ? current : [...current, boardId];
    });
  }, []);

  const cancel = useCallback(() => setSelectedIds(null), []);

  const confirm = useCallback(async () => {
    if (!selectedIds) return;
    setSelectedIds(null);
    try {
      await applyPinnedBoards(folderBoards, selectedIds, boardRepository);
      // Algum quadro novo fixado: a exclusão de um fixado da pasta não pode mais ser desfeita.
      const pinnedNew = folderBoards.some(
        (board) => board.pinnedAt === null && selectedIds.includes(board.id),
      );
      const folderId = folderBoards[0]?.folderId;
      if (pinnedNew && folderId) historyStore.forgetPinnedBoardRestores(folderId);
    } catch (error: unknown) {
      console.warn('Falha ao fixar os quadros.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, [folderBoards, selectedIds]);

  return {
    isSelecting,
    selectedIds: selectedIds ?? [],
    title: text.pinSelectionTitle(selectedIds?.length ?? 0),
    start,
    toggle,
    cancel,
    confirm,
  };
}
