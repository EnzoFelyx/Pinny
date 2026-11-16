import { stackedIds, stackRotation } from './batchStack';

describe('stackedIds', () => {
  test('returns the other selected cards, in board order, up to the visible limit', () => {
    expect(stackedIds('b', ['a', 'b', 'c', 'd', 'e', 'f'], 5)).toEqual(['a', 'c', 'd', 'e']);
  });

  test('returns nothing when only the held card fits', () => {
    expect(stackedIds('a', ['a', 'b'], 1)).toEqual([]);
    expect(stackedIds('a', ['a', 'b'], 0)).toEqual([]);
  });
});

describe('stackRotation', () => {
  test('alternates the sides, growing one step every two cards', () => {
    const angles = [0, 1, 2, 3, 4].map((depth) => stackRotation(depth, -5, 3));

    expect(angles).toEqual([-5, -2, -8, 1, -11]);
  });
});
