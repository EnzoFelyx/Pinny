import { assignEmptyVariants, EMPTY_VARIANTS } from './emptyVariants';

// Sorteio previsível: sempre a primeira variação livre.
const first = () => 0;

describe('assignEmptyVariants', () => {
  test('keeps the variant a column already had', () => {
    const result = assignEmptyVariants(['a', 'b'], { a: 3 }, first);

    expect(result.a).toBe(3);
  });

  test('gives each new empty column a variant that is still free', () => {
    const result = assignEmptyVariants(['a', 'b', 'c'], { a: 0 }, first);

    expect(result).toEqual({ a: 0, b: 1, c: 2 });
  });

  test('does not repeat a variant while one is free', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];

    const result = assignEmptyVariants(ids, {});

    expect(new Set(Object.values(result)).size).toBe(EMPTY_VARIANTS.length);
  });

  test('repeats a variant from the sixth empty column on', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];

    const result = assignEmptyVariants(ids, {}, first);

    expect(result.f).toBe(0);
  });

  test('drops columns that are no longer empty, freeing their variant', () => {
    const result = assignEmptyVariants(['b'], { a: 0, b: 1 }, first);

    expect(result).toEqual({ b: 1 });
  });

  test('stays inside the list even if the random source returns 1', () => {
    const result = assignEmptyVariants(['a'], {}, () => 1);

    expect(EMPTY_VARIANTS).toContain(result.a);
  });
});
