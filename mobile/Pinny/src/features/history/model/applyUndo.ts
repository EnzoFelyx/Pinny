import type { Card } from '@/features/card/model/card.schema';
import type { CardPatch, CardRepository } from '@/features/card/model/cardRepository';
import {
  removeColumnWithCards,
  restoreColumnWithCards,
} from '@/features/board/model/columnRemoval';
import {
  removeBoardWithContent,
  restoreBoardWithContent,
} from '@/features/board/model/boardRemoval';
import { restoreBoardPlace } from '@/features/board/model/boardMove';
import type { BoardRepository } from '@/features/board/model/boardRepository';
import type { ColumnRepository } from '@/features/board/model/columnRepository';
import type { LabelRepository } from '@/features/board/model/labelRepository';
import {
  removeFolderWithContent,
  restoreFolderWithContent,
} from '@/features/folders/model/folderRemoval';
import type { FolderRepository } from '@/features/folders/model/folderRepository';

import type { UndoOperation } from './actionHistory';

// Aplica as operações do histórico no banco. Cada caso devolve a inversa (o que refaz o que
// acabou de ser desfeito). Uma ação nova com desfazer ganha um tipo em actionHistory.ts e um caso
// aqui.

export interface UndoRepositories {
  cards: CardRepository;
  columns: ColumnRepository;
  boards: BoardRepository;
  labels: LabelRepository;
  folders: FolderRepository;
}

// Campos do patch com os valores atuais do cartão: o que é preciso para voltar uma edição.
function currentValuesOf(card: Card, patch: CardPatch): CardPatch {
  const fields = Object.keys(patch) as (keyof CardPatch)[];
  return fields.reduce<CardPatch>((values, field) => ({ ...values, [field]: card[field] }), {});
}

// Aplica a operação e devolve a inversa dela (o que refaz o que acabou de ser desfeito).
// null = não há como inverter (ex.: o cartão não existe mais).
export async function applyUndo(
  operation: UndoOperation,
  repositories: UndoRepositories,
): Promise<UndoOperation | null> {
  const { cards, columns, boards, labels } = repositories;
  switch (operation.kind) {
    case 'deleteCard': {
      const snapshot = await cards.remove(operation.cardId);
      return { kind: 'restoreCard', snapshot };
    }
    case 'moveCard': {
      const before = await cards.getById(operation.cardId);
      await cards.moveToPosition(operation.cardId, operation.columnId, operation.position);
      return before
        ? {
            kind: 'moveCard',
            cardId: before.id,
            columnId: before.columnId,
            position: before.position,
          }
        : null;
    }
    case 'updateCard': {
      const before = await cards.getById(operation.cardId);
      await cards.update(operation.cardId, operation.previous);
      return before
        ? {
            kind: 'updateCard',
            cardId: before.id,
            previous: currentValuesOf(before, operation.previous),
          }
        : null;
    }
    case 'restoreCard':
      await cards.restore(operation.snapshot);
      return { kind: 'deleteCard', cardId: operation.snapshot.card.id };
    case 'deleteCards': {
      const snapshots = await cards.removeMany(operation.cardIds);
      return { kind: 'restoreCards', snapshots };
    }
    case 'restoreCards':
      await cards.restoreAll(operation.snapshots);
      return {
        kind: 'deleteCards',
        cardIds: operation.snapshots.map((snapshot) => snapshot.card.id),
      };
    case 'setCardLabels': {
      const before = await labels.listByCard(operation.cardId);
      await labels.setForCard(operation.cardId, operation.labelIds);
      return {
        kind: 'setCardLabels',
        cardId: operation.cardId,
        labelIds: before.map((label) => label.id),
      };
    }
    case 'deleteColumn': {
      const snapshot = await removeColumnWithCards(operation.columnId, { columns, cards });
      return snapshot ? { kind: 'restoreColumn', snapshot } : null;
    }
    case 'restoreColumn':
      await restoreColumnWithCards(operation.snapshot, { columns, cards });
      return { kind: 'deleteColumn', columnId: operation.snapshot.column.id };
    case 'moveColumn': {
      const before = await columns.getById(operation.columnId);
      if (!before) return null;
      await columns.moveToPosition(operation.columnId, operation.position);
      return { kind: 'moveColumn', columnId: before.id, position: before.position };
    }
    case 'sequence': {
      const inverses: UndoOperation[] = [];
      for (const step of operation.operations) {
        const inverse = await applyUndo(step, repositories);
        if (inverse) inverses.unshift(inverse);
      }
      return { kind: 'sequence', operations: inverses };
    }
    case 'renameColumn': {
      const before = await columns.getById(operation.columnId);
      if (!before) return null;
      await columns.rename(operation.columnId, operation.title);
      return { kind: 'renameColumn', columnId: before.id, title: before.title };
    }
    case 'renameBoard': {
      const before = await boards.getById(operation.boardId);
      if (!before) return null;
      await boards.rename(operation.boardId, operation.title);
      return { kind: 'renameBoard', boardId: before.id, title: before.title };
    }
    case 'deleteBoard': {
      const snapshot = await removeBoardWithContent(operation.boardId, repositories);
      return snapshot ? { kind: 'restoreBoard', snapshot } : null;
    }
    case 'restoreBoard':
      await restoreBoardWithContent(operation.snapshot, repositories);
      return { kind: 'deleteBoard', boardId: operation.snapshot.board.id };
    case 'moveBoard': {
      const place = await restoreBoardPlace(operation.place, boards);
      return place ? { kind: 'moveBoard', place } : null;
    }
    case 'deleteFolder': {
      const snapshot = await removeFolderWithContent(operation.folderId, repositories);
      return snapshot ? { kind: 'restoreFolder', snapshot } : null;
    }
    case 'restoreFolder':
      await restoreFolderWithContent(operation.snapshot, repositories);
      return { kind: 'deleteFolder', folderId: operation.snapshot.folder.id };
  }
}
