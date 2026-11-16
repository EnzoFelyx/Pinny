import {
  MIN_POSITION_GAP,
  positionAtEnd,
  positionBetween,
  renumber,
  resolvePlacement,
} from './position';

const items = [
  { id: 'a', position: 1 },
  { id: 'b', position: 2 },
  { id: 'c', position: 3 },
];

describe('positionAtEnd', () => {
  test('returns the first step for an empty list', () => {
    expect(positionAtEnd([])).toBe(1);
  });

  test('returns one step after the last item', () => {
    expect(positionAtEnd(items)).toBe(4);
  });
});

describe('positionBetween', () => {
  test('returns the midpoint between two neighbors', () => {
    expect(positionBetween(1, 2)).toBe(1.5);
  });

  test('goes one step before the next item when there is no previous', () => {
    expect(positionBetween(undefined, 1)).toBe(0);
  });

  test('goes one step after the previous item when there is no next', () => {
    expect(positionBetween(3, undefined)).toBe(4);
  });

  test('returns the first step when there are no neighbors', () => {
    expect(positionBetween()).toBe(1);
  });
});

describe('renumber', () => {
  test('gives whole positions in the same order', () => {
    const squeezed = [
      { id: 'a', position: 0.1 },
      { id: 'b', position: 0.1000001 },
    ];

    expect(renumber(squeezed)).toEqual([
      { id: 'a', position: 1 },
      { id: 'b', position: 2 },
    ]);
  });
});

describe('resolvePlacement', () => {
  test('puts the item at the end when no neighbor is given', () => {
    expect(resolvePlacement(items, {})).toEqual({ position: 4, rebalanced: [] });
  });

  test('puts the item between its neighbors without touching the others', () => {
    const result = resolvePlacement(items, { previousId: 'a', nextId: 'b' });

    expect(result).toEqual({ position: 1.5, rebalanced: [] });
  });

  test('puts the item before the first one when only nextId is given', () => {
    expect(resolvePlacement(items, { nextId: 'a' }).position).toBe(0);
  });

  test('puts the item after the last one when only previousId is given', () => {
    expect(resolvePlacement(items, { previousId: 'c' }).position).toBe(4);
  });

  test('renumbers the list when the gap between neighbors is too small', () => {
    const squeezed = [
      { id: 'a', position: 1 },
      { id: 'b', position: 1 + MIN_POSITION_GAP / 2 },
    ];

    const result = resolvePlacement(squeezed, { previousId: 'a', nextId: 'b' });

    expect(result.rebalanced).toEqual([
      { id: 'a', position: 1 },
      { id: 'b', position: 2 },
    ]);
    expect(result.position).toBe(1.5);
  });

  test('throws when a neighbor is not in the destination list', () => {
    expect(() => resolvePlacement(items, { previousId: 'missing' })).toThrow('missing');
  });
});
