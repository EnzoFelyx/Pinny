import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import { cardRepository } from '@/features/card/model/cardRepository';
import { checklistRepository } from '@/features/card/model/checklistRepository';
import { folderRepository } from '@/features/folders/model/folderRepository';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/time';

import {
  type HistoryEntry,
  popEntry,
  pushEntry,
  restoresPinnedBoardIn,
  type UndoOperation,
} from './actionHistory';
import { applyUndo, type UndoRepositories } from './applyUndo';

// Histórico de ações do app inteiro (só em memória, como o "Desfazer" de qualquer app).
// Duas pilhas: desfazer leva a ação para "refazer", e refazer a devolve para "desfazer".
// Uma ação nova limpa o "refazer", como em qualquer editor.
let undoStack: readonly HistoryEntry[] = [];
let redoStack: readonly HistoryEntry[] = [];
let isBusy = false;

const defaultRepositories: UndoRepositories = {
  cards: cardRepository,
  columns: columnRepository,
  boards: boardRepository,
  labels: labelRepository,
  folders: folderRepository,
  checklist: checklistRepository,
};

// Tira a última entrada de uma pilha, aplica e guarda a inversa na outra.
async function transfer(
  from: readonly HistoryEntry[],
  repositories: UndoRepositories,
): Promise<{
  entry: HistoryEntry;
  rest: readonly HistoryEntry[];
  inverse: HistoryEntry | null;
} | null> {
  const { entry, rest } = popEntry(from);
  if (!entry || isBusy) return null;

  isBusy = true;
  try {
    const inverseOperation = await applyUndo(entry.undo, repositories);
    const inverse = inverseOperation
      ? { ...entry, id: createId(), createdAt: nowIso(), undo: inverseOperation }
      : null;
    return { entry, rest, inverse };
  } finally {
    isBusy = false;
  }
}

export const historyStore = {
  // Nome da próxima ação a desfazer e a refazer (para o alerta do chacoalhar). null = nenhuma.
  nextUndoName(): string | null {
    return undoStack.at(-1)?.description ?? null;
  },

  nextRedoName(): string | null {
    return redoStack.at(-1)?.description ?? null;
  },

  record(description: string, undo: UndoOperation): void {
    undoStack = pushEntry(undoStack, { id: createId(), description, createdAt: nowIso(), undo });
    redoStack = [];
  },

  // Quadro novo fixado na pasta: a exclusão de um quadro fixado dela não pode mais ser desfeita
  // (ele voltaria fixado e a pasta passaria do limite de fixados).
  forgetPinnedBoardRestores(folderId: string): void {
    const keeps = (entry: HistoryEntry) => !restoresPinnedBoardIn(entry.undo, folderId);
    undoStack = undoStack.filter(keeps);
    redoStack = redoStack.filter(keeps);
  },

  // Desfaz a última ação. null = nada para desfazer (ou outra operação em andamento).
  async undoLast(
    repositories: UndoRepositories = defaultRepositories,
  ): Promise<HistoryEntry | null> {
    const result = await transfer(undoStack, repositories);
    if (!result) return null;
    undoStack = result.rest;
    if (result.inverse) redoStack = pushEntry(redoStack, result.inverse);
    return result.entry;
  },

  // Refaz a última ação desfeita. null = nada para refazer.
  async redoLast(
    repositories: UndoRepositories = defaultRepositories,
  ): Promise<HistoryEntry | null> {
    const result = await transfer(redoStack, repositories);
    if (!result) return null;
    redoStack = result.rest;
    if (result.inverse) undoStack = pushEntry(undoStack, result.inverse);
    return result.entry;
  },
};
