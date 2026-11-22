import { act, renderHook } from '@testing-library/react-native';

import { type CardFilter, EMPTY_CARD_FILTER } from '../model/cardFilter';
import { openSectionsWithResults, useArchivedSections } from './useArchivedSections';

interface Props {
  sections: { key: string; cards: string[] }[];
  term: string;
  filter: CardFilter;
  hasActiveFilter: boolean;
}

const allCards = [
  { key: 'todo', cards: ['a'] },
  { key: 'done', cards: ['b', 'c'] },
];

const renderSections = (initial: Partial<Props> = {}) =>
  renderHook(({ sections, ...narrowing }: Props) => useArchivedSections(sections, narrowing), {
    initialProps: {
      sections: allCards,
      term: '',
      filter: EMPTY_CARD_FILTER,
      hasActiveFilter: false,
      ...initial,
    },
  });

describe('useArchivedSections', () => {
  test('starts with every section open', async () => {
    const { result } = await renderSections();

    expect(result.current.isExpanded('todo')).toBe(true);
    expect(result.current.isExpanded('done')).toBe(true);
  });

  test('closes and opens a section on each toggle', async () => {
    const { result } = await renderSections();

    await act(() => result.current.toggle('done'));
    expect(result.current.isExpanded('done')).toBe(false);
    expect(result.current.isExpanded('todo')).toBe(true);

    await act(() => result.current.toggle('done'));
    expect(result.current.isExpanded('done')).toBe(true);
  });

  test('opens the closed sections that have results when the search changes', async () => {
    const { result, rerender } = await renderSections();
    await act(() => result.current.toggle('todo'));
    await act(() => result.current.toggle('done'));

    await rerender({
      sections: [
        { key: 'todo', cards: [] },
        { key: 'done', cards: ['b'] },
      ],
      term: 'b',
      filter: EMPTY_CARD_FILTER,
      hasActiveFilter: false,
    });

    expect(result.current.isExpanded('done')).toBe(true);
    // Sem resultado, a seção continua como o usuário deixou.
    expect(result.current.isExpanded('todo')).toBe(false);
  });

  test('lets the user close a section while the search is open', async () => {
    const { result } = await renderSections({ term: 'b' });

    await act(() => result.current.toggle('done'));

    expect(result.current.isExpanded('done')).toBe(false);
  });

  test('opens the sections with results when a filter is applied', async () => {
    const { result, rerender } = await renderSections();
    await act(() => result.current.toggle('done'));

    await rerender({
      sections: allCards,
      term: '',
      filter: { ...EMPTY_CARD_FILTER, priorities: ['high'] },
      hasActiveFilter: true,
    });

    expect(result.current.isExpanded('done')).toBe(true);
  });

  test('keeps closed sections closed when the search is cleared', async () => {
    const { result, rerender } = await renderSections({ term: 'b' });
    await act(() => result.current.toggle('done'));

    await rerender({
      sections: allCards,
      term: '',
      filter: EMPTY_CARD_FILTER,
      hasActiveFilter: false,
    });

    expect(result.current.isExpanded('done')).toBe(false);
  });
});

describe('openSectionsWithResults', () => {
  test('returns the same set when nothing needs to open', () => {
    const collapsed = new Set(['todo']);

    expect(openSectionsWithResults(collapsed, [{ key: 'todo', cards: [] }])).toBe(collapsed);
  });
});
