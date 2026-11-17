import {
  columnIndexAt,
  computeOffsets,
  edgePlacement,
  indexFromCenter,
  moveIndex,
  toFullIndex,
  toFullIndexExcluding,
  toPlacement,
  totalHeight,
} from './reorder';

const GAP = 10;
const ESTIMATED = 40;
const ids = ['a', 'b', 'c'];
// 'c' ainda não foi medido: usa a altura estimada.
const heights = { a: 50, b: 30 };

describe('moveIndex', () => {
  test('moves the item to the new index without changing the original list', () => {
    const original = ['a', 'b', 'c'];

    const result = moveIndex(original, 0, 2);

    expect(result).toEqual(['b', 'c', 'a']);
    expect(original).toEqual(['a', 'b', 'c']);
  });

  test('returns the same order when the origin index does not exist', () => {
    expect(moveIndex(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
});

describe('computeOffsets', () => {
  test('stacks each card below the previous ones, with the gap between them', () => {
    expect(computeOffsets(ids, heights, GAP, ESTIMATED)).toEqual({ a: 0, b: 60, c: 100 });
  });
});

describe('totalHeight', () => {
  test('adds the heights and the gaps between the cards', () => {
    expect(totalHeight(ids, heights, GAP, ESTIMATED)).toBe(140);
  });

  test('is zero for an empty column', () => {
    expect(totalHeight([], {}, GAP, ESTIMATED)).toBe(0);
  });
});

describe('indexFromCenter', () => {
  const offsets = { a: 0, b: 60, c: 100 };

  test('counts the other cards whose middle is above the dragged center', () => {
    // Meio de b = 75; meio de c = 120.
    expect(indexFromCenter(80, 'a', ids, offsets, heights, ESTIMATED)).toBe(1);
  });

  test('is the first slot when the center is above every other card', () => {
    expect(indexFromCenter(10, 'a', ids, offsets, heights, ESTIMATED)).toBe(0);
  });

  test('is the last slot when the center is below every other card', () => {
    expect(indexFromCenter(500, 'a', ids, offsets, heights, ESTIMATED)).toBe(2);
  });
});

describe('toPlacement', () => {
  test('returns both neighbors for a card in the middle', () => {
    expect(toPlacement(ids, 'b')).toEqual({ previousId: 'a', nextId: 'c' });
  });

  test('has no previous neighbor for the first card', () => {
    expect(toPlacement(ids, 'a')).toEqual({ previousId: null, nextId: 'b' });
  });

  test('has no next neighbor for the last card', () => {
    expect(toPlacement(ids, 'c')).toEqual({ previousId: 'b', nextId: null });
  });
});

describe('columnIndexAt', () => {
  const PITCH = 300;
  const COLUMN_GAP = 12;

  test('returns the column under the point', () => {
    expect(columnIndexAt(0, PITCH, COLUMN_GAP, 3)).toBe(0);
    expect(columnIndexAt(350, PITCH, COLUMN_GAP, 3)).toBe(1);
  });

  test('switches columns in the middle of the gap between them', () => {
    expect(columnIndexAt(293, PITCH, COLUMN_GAP, 3)).toBe(0);
    expect(columnIndexAt(294, PITCH, COLUMN_GAP, 3)).toBe(1);
  });

  test('clamps to the first and last columns outside the board', () => {
    expect(columnIndexAt(-50, PITCH, COLUMN_GAP, 3)).toBe(0);
    expect(columnIndexAt(5000, PITCH, COLUMN_GAP, 3)).toBe(2);
  });

  test('returns -1 when there are no columns', () => {
    expect(columnIndexAt(10, PITCH, COLUMN_GAP, 0)).toBe(-1);
  });
});

describe('edgePlacement', () => {
  test('places the card before the first of the others at the start', () => {
    expect(edgePlacement(ids, 'b', 'start')).toEqual({ previousId: null, nextId: 'a' });
  });

  test('places the card after the last of the others at the end', () => {
    expect(edgePlacement(ids, 'b', 'end')).toEqual({ previousId: 'c', nextId: null });
  });

  test('has no neighbors when the card is alone in the column', () => {
    expect(edgePlacement(['a'], 'a', 'start')).toEqual({ previousId: null, nextId: null });
  });
});

describe('toFullIndex', () => {
  // h1 e h2 estão escondidos pelo filtro; o cartão arrastado é o 'c'.
  const columnIds = ['a', 'h1', 'b', 'h2', 'c'];
  const visible = new Set(['a', 'b', 'c']);

  test('goes right before the first visible card in the first slot', () => {
    expect(toFullIndex(columnIds, 'c', visible, 0)).toBe(0);
  });

  test('goes right after the visible neighbor above', () => {
    expect(toFullIndex(columnIds, 'c', visible, 1)).toBe(1);
    expect(toFullIndex(columnIds, 'c', visible, 2)).toBe(3);
  });

  test('clamps a slot beyond the visible cards to after the last visible one', () => {
    expect(toFullIndex(columnIds, 'c', visible, 9)).toBe(3);
  });

  test('goes to the top when no other card is visible', () => {
    expect(toFullIndex(columnIds, 'c', new Set(['c']), 0)).toBe(0);
  });
});

describe('toFullIndexExcluding', () => {
  test('ignores every moved card and treats all as visible without a filter', () => {
    const result = toFullIndexExcluding(['a', 'b', 'c', 'd'], new Set(['b', 'c']), null, 1);

    expect(result).toBe(1);
  });
});
