import { makeBoard, makeBoardCard, makeColumn, makeLabel } from '@/test/factories';

import type { BoardData } from './boardData';
import {
  activeFilterParts,
  type CardFilter,
  countMatchingCards,
  EMPTY_CARD_FILTER,
  isFilterActive,
  matchesCardFilter,
  matchesSearch,
  toggleIn,
  visibleCardIds,
  withoutFilterPart,
  withQuickFilterToggled,
} from './cardFilter';

// Segunda, 18 de maio de 2026, meio-dia (horário do Brasil).
const now = new Date(2026, 4, 18, 12, 0);
const at = (day: number, hour = 12) => new Date(2026, 4, day, hour).toISOString();
const filterWith = (overrides: Partial<CardFilter>): CardFilter => ({
  ...EMPTY_CARD_FILTER,
  ...overrides,
});

describe('matchesCardFilter', () => {
  test('shows every card, including completed ones, with the empty filter', () => {
    const completed = makeBoardCard({ completedAt: at(17) });

    expect(matchesCardFilter(makeBoardCard(), EMPTY_CARD_FILTER, now)).toBe(true);
    expect(matchesCardFilter(completed, EMPTY_CARD_FILTER, now)).toBe(true);
  });

  test('hides completed cards when showCompleted is off', () => {
    const filter = filterWith({ showCompleted: false });

    expect(matchesCardFilter(makeBoardCard({ completedAt: at(17) }), filter, now)).toBe(false);
    expect(matchesCardFilter(makeBoardCard(), filter, now)).toBe(true);
  });

  test('keeps only cards with unfinished checklist items', () => {
    const filter = filterWith({ onlyPendingChecklist: true });
    const pending = makeBoardCard({}, { checklist: { done: 1, total: 3 } });
    const finished = makeBoardCard({}, { checklist: { done: 3, total: 3 } });

    expect(matchesCardFilter(pending, filter, now)).toBe(true);
    expect(matchesCardFilter(finished, filter, now)).toBe(false);
    expect(matchesCardFilter(makeBoardCard(), filter, now)).toBe(false);
  });

  test('matches any of the chosen priorities', () => {
    const filter = filterWith({ priorities: ['high', 'medium'] });

    expect(matchesCardFilter(makeBoardCard({ priority: 'high' }), filter, now)).toBe(true);
    expect(matchesCardFilter(makeBoardCard({ priority: 'low' }), filter, now)).toBe(false);
    expect(matchesCardFilter(makeBoardCard({ priority: null }), filter, now)).toBe(false);
  });

  test('matches any of the chosen labels', () => {
    const filter = filterWith({ labelIds: ['study', 'home'] });
    const withStudy = makeBoardCard({}, { labels: [makeLabel({ id: 'study' })] });
    const withWork = makeBoardCard({}, { labels: [makeLabel({ id: 'work' })] });

    expect(matchesCardFilter(withStudy, filter, now)).toBe(true);
    expect(matchesCardFilter(withWork, filter, now)).toBe(false);
  });

  test('requires every category at the same time', () => {
    const filter = filterWith({ priorities: ['high'], labelIds: ['study'] });
    const highWithoutLabel = makeBoardCard({ priority: 'high' });
    const highWithLabel = makeBoardCard(
      { priority: 'high' },
      { labels: [makeLabel({ id: 'study' })] },
    );

    expect(matchesCardFilter(highWithoutLabel, filter, now)).toBe(false);
    expect(matchesCardFilter(highWithLabel, filter, now)).toBe(true);
  });

  describe('deadline', () => {
    test('"none" keeps only cards without a due date', () => {
      const filter = filterWith({ deadline: 'none' });

      expect(matchesCardFilter(makeBoardCard(), filter, now)).toBe(true);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(18) }), filter, now)).toBe(false);
    });

    test('"today" keeps cards due at any time today', () => {
      const filter = filterWith({ deadline: 'today' });

      expect(matchesCardFilter(makeBoardCard({ dueAt: at(18, 8) }), filter, now)).toBe(true);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(18, 23) }), filter, now)).toBe(true);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(19, 0) }), filter, now)).toBe(false);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(17, 23) }), filter, now)).toBe(false);
      expect(matchesCardFilter(makeBoardCard(), filter, now)).toBe(false);
    });

    test('"upcoming" keeps cards due from today up to the next 7 days', () => {
      const filter = filterWith({ deadline: 'upcoming' });

      expect(matchesCardFilter(makeBoardCard({ dueAt: at(18, 8) }), filter, now)).toBe(true);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(24, 23) }), filter, now)).toBe(true);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(25, 0) }), filter, now)).toBe(false);
    });

    test('"overdue" keeps only unfinished cards past the due date', () => {
      const filter = filterWith({ deadline: 'overdue' });
      const late = makeBoardCard({ dueAt: at(18, 11) });
      const lateButDone = makeBoardCard({ dueAt: at(18, 11), completedAt: at(18, 11) });

      expect(matchesCardFilter(late, filter, now)).toBe(true);
      expect(matchesCardFilter(lateButDone, filter, now)).toBe(false);
      expect(matchesCardFilter(makeBoardCard({ dueAt: at(18, 13) }), filter, now)).toBe(false);
    });
  });
});

describe('countMatchingCards', () => {
  test('counts the cards that pass the filter', () => {
    const cards = [
      makeBoardCard({ priority: 'high' }),
      makeBoardCard({ priority: 'low' }),
      makeBoardCard({ priority: 'high' }),
    ];

    expect(countMatchingCards(cards, filterWith({ priorities: ['high'] }), now)).toBe(2);
  });
});

describe('toggleIn', () => {
  test('adds a missing value and removes an existing one, keeping the original list', () => {
    const original = ['a', 'b'];

    expect(toggleIn(original, 'c')).toEqual(['a', 'b', 'c']);
    expect(toggleIn(original, 'a')).toEqual(['b']);
    expect(original).toEqual(['a', 'b']);
  });
});

describe('withQuickFilterToggled', () => {
  test('turns a deadline shortcut on and off', () => {
    const on = withQuickFilterToggled(EMPTY_CARD_FILTER, 'today');

    expect(on.deadline).toBe('today');
    expect(withQuickFilterToggled(on, 'today').deadline).toBe('any');
  });

  test('replaces one deadline shortcut with the other', () => {
    const today = withQuickFilterToggled(EMPTY_CARD_FILTER, 'today');

    expect(withQuickFilterToggled(today, 'overdue').deadline).toBe('overdue');
  });

  test('toggles the high priority without touching the others', () => {
    const filter = filterWith({ priorities: ['low'] });

    expect(withQuickFilterToggled(filter, 'high').priorities).toEqual(['low', 'high']);
  });
});

describe('active filter parts', () => {
  const filter = filterWith({
    deadline: 'today',
    priorities: ['high'],
    labelIds: ['study'],
    showCompleted: false,
    onlyPendingChecklist: true,
  });

  test('lists one part for each active piece of the filter', () => {
    expect(activeFilterParts(filter)).toEqual([
      { kind: 'deadline', deadline: 'today' },
      { kind: 'priority', priority: 'high' },
      { kind: 'label', labelId: 'study' },
      { kind: 'hideCompleted' },
      { kind: 'pendingChecklist' },
    ]);
  });

  test('has no parts and is inactive for the empty filter', () => {
    expect(activeFilterParts(EMPTY_CARD_FILTER)).toEqual([]);
    expect(isFilterActive(EMPTY_CARD_FILTER)).toBe(false);
    expect(isFilterActive(filter)).toBe(true);
  });

  test('removing every part brings back the empty filter', () => {
    const cleared = activeFilterParts(filter).reduce(withoutFilterPart, filter);

    expect(cleared).toEqual(EMPTY_CARD_FILTER);
  });
});

describe('matchesSearch', () => {
  const card = makeBoardCard({ title: 'Estúdio de música', description: 'Levar o violão' });

  test('finds the term in the title or in the description, ignoring accents and case', () => {
    expect(matchesSearch(card, 'estudio')).toBe(true);
    expect(matchesSearch(card, 'violao')).toBe(true);
  });

  test('does not match a card without the term', () => {
    expect(matchesSearch(card, 'mercado')).toBe(false);
  });

  test('matches every card when the term is empty', () => {
    expect(matchesSearch(card, '')).toBe(true);
  });
});

describe('visibleCardIds', () => {
  const data: BoardData = {
    board: makeBoard(),
    folderTitle: 'Pessoal',
    columns: [
      {
        column: makeColumn({ id: 'todo' }),
        cards: [
          makeBoardCard({ id: 'study', title: 'Estudar', priority: 'high' }),
          makeBoardCard({ id: 'market', title: 'Mercado', priority: 'low' }),
        ],
      },
      {
        column: makeColumn({ id: 'done' }),
        cards: [makeBoardCard({ id: 'study-2', title: 'Estudar inglês', priority: 'low' })],
      },
    ],
  };

  test('is null without a filter or a search (every card shows)', () => {
    expect(visibleCardIds(data, EMPTY_CARD_FILTER, now)).toBeNull();
  });

  test('returns the cards that pass the filter across all columns', () => {
    const visible = visibleCardIds(data, filterWith({ priorities: ['low'] }), now);

    expect(visible).toEqual(new Set(['market', 'study-2']));
  });

  test('applies the filter and the search together', () => {
    const visible = visibleCardIds(data, filterWith({ priorities: ['low'] }), now, 'estudar');

    expect(visible).toEqual(new Set(['study-2']));
  });
});
