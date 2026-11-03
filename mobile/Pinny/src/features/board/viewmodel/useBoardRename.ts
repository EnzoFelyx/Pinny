import { useCallback } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, withBoardRenamed } from '../model/boardData';
import { boardRepository } from '../model/boardRepository';

interface BoardRenameOptions {
  data: BoardData | null;
  // Troca o retrato do quadro na tela antes de gravar (atualização otimista).
  onDataChange: (data: BoardData) => void;
  onSaveError: () => void;
}

// Título do quadro editado ali mesmo (toque no nome ou "Renomear quadro" no menu). O nome novo
// aparece na hora; se a gravação falhar, o antigo volta. Entra no histórico (chacoalhar desfaz).
export function useBoardRename({ data, onDataChange, onSaveError }: BoardRenameOptions) {
  return useCallback(
    async (title: string) => {
      if (!data || data.board.title === title) return;
      const { id, title: previousTitle } = data.board;
      onDataChange(withBoardRenamed(data, title));
      try {
        await boardRepository.rename(id, title);
        historyStore.record(ptBR.history.actions.renameBoard, {
          kind: 'renameBoard',
          boardId: id,
          title: previousTitle,
        });
      } catch (error: unknown) {
        console.warn('Falha ao renomear o quadro.', error);
        onDataChange(data);
        onSaveError();
      }
    },
    [data, onDataChange, onSaveError],
  );
}
