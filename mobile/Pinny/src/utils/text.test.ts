import { normalizeForSearch, splitByMatch } from './text';

describe('normalizeForSearch', () => {
  test('removes accents, case and the spaces around', () => {
    expect(normalizeForSearch('  Estúdio de Música ')).toBe('estudio de musica');
  });
});

describe('splitByMatch', () => {
  test('marks the matching part, keeping the original accents and case', () => {
    expect(splitByMatch('Estúdio', 'estu')).toEqual([
      { text: 'Estú', isMatch: true },
      { text: 'dio', isMatch: false },
    ]);
  });

  test('marks a match in the middle of the text', () => {
    expect(splitByMatch('Meu Café bom', 'cafe')).toEqual([
      { text: 'Meu ', isMatch: false },
      { text: 'Café', isMatch: true },
      { text: ' bom', isMatch: false },
    ]);
  });

  test('marks every occurrence', () => {
    expect(splitByMatch('banana', 'an')).toEqual([
      { text: 'b', isMatch: false },
      { text: 'an', isMatch: true },
      { text: 'an', isMatch: true },
      { text: 'a', isMatch: false },
    ]);
  });

  test('keeps emoji whole next to a match', () => {
    expect(splitByMatch('🎉 Festa', 'festa')).toEqual([
      { text: '🎉 ', isMatch: false },
      { text: 'Festa', isMatch: true },
    ]);
  });

  test('returns null when the term is empty or does not appear', () => {
    expect(splitByMatch('Estúdio', '')).toBeNull();
    expect(splitByMatch('Estúdio', 'mercado')).toBeNull();
  });
});
