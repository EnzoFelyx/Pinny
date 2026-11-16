import { makeBoard } from '@/test/factories';

import {
  type HistoryEntry,
  popEntry,
  pushEntry,
  restoresPinnedBoardIn,
  type UndoOperation,
} from './actionHistory';

const entry = (id: string): HistoryEntry => ({
  id,
  description: 'Movimento',
  createdAt: '2026-05-18T12:00:00.000Z',
  undo: { kind: 'deleteCard', cardId: id },
});

describe('pushEntry', () => {
  test('adds the entry at the end without changing the original stack', () => {
    const history = [entry('a')];

    const result = pushEntry(history, entry('b'));

    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
    expect(history).toHaveLength(1);
  });

  test('drops the oldest entries beyond the limit', () => {
    const history = [entry('a'), entry('b')];

    const result = pushEntry(history, entry('c'), 2);

    expect(result.map((item) => item.id)).toEqual(['b', 'c']);
  });
});

describe('popEntry', () => {
  test('returns the last entry and the rest of the stack', () => {
    const { entry: last, rest } = popEntry([entry('a'), entry('b')]);

    expect(last?.id).toBe('b');
    expect(rest.map((item) => item.id)).toEqual(['a']);
  });

  test('returns no entry for an empty stack', () => {
    expect(popEntry([])).toEqual({ entry: undefined, rest: [] });
  });
});

describe('restoresPinnedBoardIn', () => {
  const restoreBoard = (folderId: string, pinnedAt: string | null): UndoOperation => ({
    kind: 'restoreBoard',
    snapshot: { board: makeBoard({ folderId, pinnedAt }), labels: [], columns: [] },
  });
  const PINNED_AT = '2026-05-18T12:00:00.000Z';

  test('is true when the operation brings back a pinned board of the folder', () => {
    expect(restoresPinnedBoardIn(restoreBoard('folder-1', PINNED_AT), 'folder-1')).toBe(true);
  });

  test('is false for a board that was not pinned or belongs to another folder', () => {
    expect(restoresPinnedBoardIn(restoreBoard('folder-1', null), 'folder-1')).toBe(false);
    expect(restoresPinnedBoardIn(restoreBoard('folder-2', PINNED_AT), 'folder-1')).toBe(false);
  });

  test('looks inside a sequence of operations', () => {
    const sequence: UndoOperation = {
      kind: 'sequence',
      operations: [{ kind: 'deleteCard', cardId: 'a' }, restoreBoard('folder-1', PINNED_AT)],
    };

    expect(restoresPinnedBoardIn(sequence, 'folder-1')).toBe(true);
  });
});
