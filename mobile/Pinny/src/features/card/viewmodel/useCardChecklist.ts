import { useCallback } from 'react';

import type { UndoOperation } from '@/features/history/model/actionHistory';
import { ptBR } from '@/i18n/pt-BR';

import type { ChecklistItem } from '../model/card.schema';
import {
  addChecklistItem,
  removeChecklistItem,
  renameChecklistItem,
  setChecklistItemDone,
} from '../model/cardEdits';
import { checklistRepository } from '../model/checklistRepository';

const text = ptBR.card.steps;
const actionName = ptBR.history.actions.editChecklist;

// Um passo pronto para a tela.
export interface ChecklistItemView {
  id: string;
  text: string;
  isDone: boolean;
  accessibilityLabel: string;
}

type RunEdit = (actionName: string, edit: () => Promise<UndoOperation | null>) => Promise<void>;

interface CardChecklistOptions {
  cardId: string;
  items: readonly ChecklistItem[];
  // Grava e registra o desfazer (do ViewModel da tela do cartão).
  runEdit: RunEdit;
}

// Checklist da tela do cartão: marcar, renomear, apagar e adicionar passos. Cada mudança grava na
// hora e entra no histórico ("Edição do Checklist").
export function useCardChecklist({ cardId, items, runEdit }: CardChecklistOptions) {
  const toggle = useCallback(
    (itemId: string, isDone: boolean) => {
      void runEdit(actionName, () => setChecklistItemDone(itemId, isDone, checklistRepository));
    },
    [runEdit],
  );

  const remove = useCallback(
    (itemId: string) => {
      void runEdit(actionName, () => removeChecklistItem(itemId, checklistRepository));
    },
    [runEdit],
  );

  // Texto vazio apaga o passo (como no app Lembretes).
  const rename = useCallback(
    (itemId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        remove(itemId);
        return;
      }
      void runEdit(actionName, () => renameChecklistItem(itemId, trimmed, checklistRepository));
    },
    [runEdit, remove],
  );

  const add = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      void runEdit(actionName, () => addChecklistItem(cardId, trimmed, checklistRepository));
    },
    [cardId, runEdit],
  );

  const done = items.filter((item) => item.isDone).length;
  const total = items.length;

  return {
    title: text.title,
    hasItems: total > 0,
    progress: total > 0 ? done / total : 0,
    progressText: text.progress(done, total),
    progressA11y: text.progressA11y(done, total),
    items: items.map((item): ChecklistItemView => ({
      id: item.id,
      text: item.text,
      isDone: item.isDone,
      accessibilityLabel: text.itemLabel(item.text),
    })),
    toggle,
    rename,
    remove,
    add,
  };
}

export type CardChecklistViewModel = ReturnType<typeof useCardChecklist>;
