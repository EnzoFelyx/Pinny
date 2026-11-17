import { z } from 'zod';

import { CorruptedDataError, parseRow, parseRows } from './validation';

const schema = z.object({ id: z.string(), position: z.number() });

describe('parseRow', () => {
  test('returns the row when it matches the schema', () => {
    expect(parseRow(schema, { id: 'a', position: 1 }, 'cards')).toEqual({ id: 'a', position: 1 });
  });

  test('throws naming the table when the row does not match', () => {
    const read = () => parseRow(schema, { id: 'a', position: 'first' }, 'cards');

    expect(read).toThrow(CorruptedDataError);
    expect(read).toThrow('cards');
  });
});

describe('parseRows', () => {
  test('validates every row', () => {
    const rows = [
      { id: 'a', position: 1 },
      { id: 'b', position: null },
    ];

    expect(() => parseRows(schema, rows, 'cards')).toThrow(CorruptedDataError);
  });
});
