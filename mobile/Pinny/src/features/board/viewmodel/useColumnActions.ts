import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import {
  type BoardData,
  withColumnMoved,
  withColumnRemoved,
  withColumnRenamed,
} from '../model/boardData';
import { duplicateColumn } from '../model/columnCopy';
import { removeColumnWithCards } from '../model/columnRemoval';
import { columnRepository } from '../model/columnRepository';
import { toPlacement } from '../model/reorder';

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

// Coluna aguardando a confirmação de exclusão, com o texto do alerta já pronto.
export interface ColumnToDelete {
  id: string;
  title: string;
  message?: string;
}

// Ações das colunas do quadro: criar, mover, renomear, duplicar e excluir. Todas entram no
// histórico (chacoalhar desfaz); o quadro recarrega sozinho quando o banco muda.
export function useColumnActions({
  boardId,
  data,
  onDataChange,
  notifyUndoable,
  onFocusColumn,
  onSaveError,
}: ColumnActionsOptions) {
  const [columnToDelete, setColumnToDelete] = useState<ColumnToDelete | null>(null);

  // "+ Adicionar coluna": abre a folha "Nova coluna".
  const createColumn = useCallback(() => {
    router.push({ pathname: '/column/new', params: { boardId } });
  }, [boardId]);

  // Cartões soltos na coluna "Adicionar coluna" (um ou a pilha do arraste em lote): a mesma folha,
  // avisando que eles vão para a coluna, na ordem dada.
  const createColumnWithCards = useCallback(
    (cardIds: readonly string[]) => {
      router.push({ pathname: '/column/new', params: { boardId, cardIds: cardIds.join(',') } });
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
      try {
        const copy = await duplicateColumn(
          target.column,
          text.columnCopyTitle(target.column.title),
          list[index + 1]?.column.id ?? null,
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

  // Puxar e segurar a coluna (ou "Excluir coluna" no menu) pede a confirmação no alerta nativo.
  // O alerta conta também os arquivados da coluna, que vão embora junto com ela.
  const requestDeleteColumn = useCallback(
    async (columnId: string) => {
      const target = data?.columns.find((item) => item.column.id === columnId);
      if (!target) return;
      const archived = await cardRepository
        .listArchivedByColumns([columnId])
        .then((cards) => cards.length)
        .catch((error: unknown) => {
          console.warn('Falha ao contar os arquivados da coluna.', error);
          return 0;
        });
      const active = target.cards.length;
      setColumnToDelete({
        id: columnId,
        title: target.column.title,
        // Sem cartões, o alerta fica só com o título.
        message: active + archived > 0 ? text.deleteColumnMessage(active, archived) : undefined,
      });
    },
    [data],
  );

  const closeDeleteColumn = useCallback(() => setColumnToDelete(null), []);

  // "Excluir" do alerta: apaga a coluna e os cartões dela, com desfazer (chacoalhar ou snackbar).
  // A coluna some da tela na hora (sem esperar a gravação e a recarga); se falhar, ela volta.
  const confirmDeleteColumn = useCallback(async () => {
    const target = columnToDelete;
    setColumnToDelete(null);
    if (!target) return;
    if (data) onDataChange(withColumnRemoved(data, target.id));
    try {
      const snapshot = await removeColumnWithCards(target.id, repositories);
      if (!snapshot) return;
      historyStore.record(ptBR.history.actions.deleteColumn, { kind: 'restoreColumn', snapshot });
      await notifyUndoable(text.columnDeleted);
    } catch (error: unknown) {
      console.warn('Falha ao excluir a coluna.', error);
      if (data) onDataChange(data);
      onSaveError();
    }
  }, [columnToDelete, data, onDataChange, notifyUndoable, onSaveError]);

  return {
    createColumn,
    createColumnWithCards,
    moveColumn,
    moveColumnTo,
    renameColumn,
    duplicateColumn: duplicate,
    columnToDelete,
    requestDeleteColumn,
    closeDeleteColumn,
    confirmDeleteColumn,
  };
}
