import { decideUndoNotice } from './undoNotice';

describe('decideUndoNotice', () => {
  test('always offers the undo button to who cannot shake', () => {
    expect(decideUndoNotice(false, false)).toBe('undoButton');
    expect(decideUndoNotice(false, true)).toBe('undoButton');
  });

  test('teaches the shake gesture the first time', () => {
    expect(decideUndoNotice(true, false)).toBe('shakeHint');
  });

  test('shows nothing to who already knows the gesture', () => {
    expect(decideUndoNotice(true, true)).toBe('none');
  });
});
