import { useCallback, useMemo } from 'react';

import { PINNED_BOARDS_PER_FOLDER } from '@/constants/limits';
import type { Board } from '@/features/board/model/board.schema';
import { pinBoards, selectionPinAction, unpinBoards } from '@/features/board/model/boardPinning';
import { boardRepository } from '@/features/board/model/boardRepository';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { useSelection } from '@/hooks/useSelection';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

// Modo "Selecionar" da tela da pasta, como a seleção de fotos do iOS: começa vazio, cada toque
// marca ou desmarca e os botões de baixo fixam/desafixam ou excluem os escolhidos. "Fixar" some
// quando a pasta passaria de PINNED_BOARDS_PER_FOLDER fixados (os já fixados contam).
export function useBoardSelection(
  folderId: string,
  folderBoards: readonly Board[],
  onDelete: (boardIds: readonly string[]) => void,
) {
  const { isSelecting, selectedIds: selected, start, cancel, toggle } = useSelection();
  const pinAction = useMemo(
    () => selectionPinAction(folderBoards, selected),
    [folderBoards, selected],
  );

  const togglePin = useCallback(async () => {
    if (!pinAction.isEnabled) return;
    cancel();
    try {
      if (pinAction.kind === 'unpin') {
        await unpinBoards(selected, boardRepository);
        return;
      }
      await pinBoards(folderBoards, selected, boardRepository);
      // Quadro novo fixado: a exclusão de um fixado da pasta não pode mais ser desfeita.
      historyStore.forgetPinnedBoardRestores(folderId);
    } catch (error: unknown) {
      console.warn('Falha ao fixar os quadros.', error);
      snackbarStore.show(ptBR.common.saveError);
    }
  }, [cancel, folderBoards, folderId, pinAction, selected]);

  const requestDelete = useCallback(() => {
    if (selected.length > 0) onDelete(selected);
  }, [onDelete, selected]);

  const isUnpin = pinAction.kind === 'unpin';

  return {
    isSelecting,
    selectedIds: selected,
    title: text.selectionTitle(selected.length),
    hint: pinAction.isLimitReached
      ? text.pinLimitHint(PINNED_BOARDS_PER_FOLDER)
      : text.selectionHint,
    // Só aparece quando vale para a seleção: some se passaria do limite de fixados.
    pin: pinAction.isEnabled
      ? {
          accessibilityLabel: isUnpin ? text.unpinSelectedA11y : text.pinSelectedA11y,
          isUnpin,
        }
      : null,
    canDelete: selected.length > 0,
    start,
    cancel,
    toggle,
    togglePin,
    requestDelete,
  };
}
