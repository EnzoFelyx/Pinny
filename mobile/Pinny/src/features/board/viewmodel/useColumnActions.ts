import { useCallback } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

import { type BoardData, withColumnMoved, withColumnRenamed } from '../model/boardData';
import { duplicateColumn } from '../model/columnCopy';
import { columnRepository } from '../model/columnRepository';
import { toPlacement } from '../model/reorder';
import { useDeleteColumn } from './useDeleteColumn';

const text = ptBR.board;
const repositories = { columns: columnRepository, cards: cardRepository };

interface ColumnActionsOptions {
  boardId: string;
  data: BoardData | null;
  // Troca o retrato do quadro na tela antes de gravar (atualização otimista).
  onDataChange: (data: BoardData) => void;
  notifyUndoable: (description: string) => Promise<void>;
  // O quadro rola até a coluna (ex.: depois de movê-la).
  onFocusColumn: (request: { columnId: string }) => void;
  onSaveError: () => void;
}

// Ações das colunas do quadro: criar, mover, renomear, duplicar e apagar (em useDeleteColumn). Todas entram no
// histórico (chacoalhar desfaz); o quadro recarrega sozinho quando o banco muda.
export function useColumnActions({
  boardId,
  data,
  onDataChange,
  notifyUndoable,
  onFocusColumn,
  onSaveError,
}: ColumnActionsOptions) {
  const deleteColumn = useDeleteColumn({ data, onDataChange, notifyUndoable, onSaveError });

  // "+ Adicionar coluna": abre a folha "Nova coluna".
  const createColumn = useCallback(() => {
    openRoute({ pathname: '/column/new', params: { boardId } });
  }, [boardId]);

  // Cartões soltos na coluna "Adicionar coluna" (um ou a pilha do arraste em lote): a mesma folha,
  // avisando que eles vão para a coluna, na ordem dada.
  const createColumnWithCards = useCallback(
    (cardIds: readonly string[]) => {
      openRoute({ pathname: '/column/new', params: { boardId, cardIds: cardIds.join(',') } });
    },
    [boardId],
  );

  // Menu da coluna: mover para trás (-1) ou para frente (+1), trocando com a vizinha. O quadro
  // acompanha a coluna até o novo lugar.
  const moveColumn = useCallback(
    async (columnId: string, step: -1 | 1) => {
      const list = data?.columns ?? [];
      const index = list.findIndex((item) => item.column.id === columnId);
      const target = list[index];
      if (!target || !list[index + step]) return;
      const placement =
        step === 1
          ? { previousId: list[index + 1]?.column.id, nextId: list[index + 2]?.column.id ?? null }
          : { previousId: list[index - 2]?.column.id ?? null, nextId: list[index - 1]?.column.id };
      try {
        await columnRepository.move(columnId, placement);
        historyStore.record(ptBR.history.actions.moveColumn, {
          kind: 'moveColumn',
          columnId,
          position: target.column.position,
        });
        onFocusColumn({ columnId });
      } catch (error: unknown) {
        console.warn('Falha ao mover a coluna.', error);
        onSaveError();
      }
    },
    [data, onFocusColumn, onSaveError],
  );

  // Coluna solta numa vaga do quadro (arraste pelo cabeçalho): a nova ordem aparece na hora,
  // antes de gravar (a cópia acabou de assentar ali); se a gravação falhar, a ordem antiga volta.
  const moveColumnTo = useCallback(
    async (columnId: string, toIndex: number) => {
      const target = data?.columns.find((item) => item.column.id === columnId);
      if (!data || !target) return;
      const next = withColumnMoved(data, columnId, toIndex);
      onDataChange(next);
      try {
        const ids = next.columns.map((item) => item.column.id);
        await columnRepository.move(columnId, toPlacement(ids, columnId));
        historyStore.record(ptBR.history.actions.moveColumn, {
          kind: 'moveColumn',
          columnId,
          position: target.column.position,
        });
        await notifyUndoable(text.columnMoved);
      } catch (error: unknown) {
        console.warn('Falha ao mover a coluna.', error);
        onDataChange(data);
        onSaveError();
      }
    },
    [data, onDataChange, notifyUndoable, onSaveError],
  );

  // Título da coluna editado ali mesmo (lápis ou nome). O nome novo aparece na hora (sem piscar
  // o antigo até o banco recarregar); se a gravação falhar, o antigo volta.
  const renameColumn = useCallback(
    async (columnId: string, title: string) => {
      const target = data?.columns.find((item) => item.column.id === columnId);
      if (!data || !target || target.column.title === title) return;
      onDataChange(withColumnRenamed(data, columnId, title));
      try {
        await columnRepository.rename(columnId, title);
        historyStore.record(ptBR.history.actions.renameColumn, {
          kind: 'renameColumn',
          columnId,
          title: target.column.title,
        });
      } catch (error: unknown) {
        console.warn('Falha ao renomear a coluna.', error);
        onDataChange(data);
        onSaveError();
      }
    },
    [data, onDataChange, onSaveError],
  );

  // Menu da coluna: cópia logo depois da original, com os cartões. O quadro rola até ela (a
  // coluna nova é percebida na recarga).
  const duplicate = useCallback(
    async (columnId: string) => {
      const list = data?.columns ?? [];
      const index = list.findIndex((item) => item.column.id === columnId);
      const target = list[index];
      if (!target) return;
      // Fora do try: o React Compiler não aceita `?.`/`??` dentro de try/catch e pularia o hook.
      const nextColumnId = list[index + 1]?.column.id ?? null;
      try {
        const copy = await duplicateColumn(
          target.column,
          text.columnCopyTitle(target.column.title),
          nextColumnId,
          repositories,
        );
        historyStore.record(ptBR.history.actions.duplicateColumn, {
          kind: 'deleteColumn',
          columnId: copy.id,
        });
      } catch (error: unknown) {
        console.warn('Falha ao duplicar a coluna.', error);
        onSaveError();
      }
    },
    [data, onSaveError],
  );

  return {
    createColumn,
    createColumnWithCards,
    moveColumn,
    moveColumnTo,
    renameColumn,
    duplicateColumn: duplicate,
    // Apagar: alerta de confirmação pronto e as ações dele.
    requestDeleteColumn: deleteColumn.request,
    columnDeleteRequest: deleteColumn.confirmRequest,
    confirmDeleteColumn: deleteColumn.confirm,
    closeDeleteColumn: deleteColumn.cancel,
  };
}
