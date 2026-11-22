import {
  formatDueDate,
  formatHour,
  formatShortDate,
  formatShortDateWithYear,
  formatWeekdayAndDate,
  relativeDayOf,
} from './date';

describe('relativeDayOf', () => {
  const now = new Date(2026, 4, 18, 12, 0);

  test('names yesterday, today and tomorrow', () => {
    expect(relativeDayOf(new Date(2026, 4, 17, 23, 59), now)).toBe('yesterday');
    expect(relativeDayOf(new Date(2026, 4, 18, 0, 1), now)).toBe('today');
    expect(relativeDayOf(new Date(2026, 4, 19, 8, 0), now)).toBe('tomorrow');
  });

  test('returns null for other days', () => {
    expect(relativeDayOf(new Date(2026, 4, 16, 12, 0), now)).toBeNull();
  });
});

describe('formatShortDateWithYear', () => {
  const now = new Date(2026, 4, 18);

  test('leaves the year out when it is the current one', () => {
    expect(formatShortDateWithYear(new Date(2026, 10, 16), now)).toBe('16 nov');
  });

  test('adds the year when it is another one', () => {
    expect(formatShortDateWithYear(new Date(2025, 10, 16), now)).toBe('16 nov 2025');
  });
});

describe('formatWeekdayAndDate', () => {
  test('writes the weekday without "-feira" and the day with the month', () => {
    expect(formatWeekdayAndDate(new Date(2026, 4, 18))).toBe('segunda, 18 de maio');
  });

  test('keeps weekend names as they are', () => {
    expect(formatWeekdayAndDate(new Date(2026, 4, 17))).toBe('domingo, 17 de maio');
  });
});

describe('formatHour', () => {
  test('shows only the hour on the hour', () => {
    expect(formatHour(new Date(2026, 4, 18, 10, 0))).toBe('10h');
  });

  test('shows the minutes with two digits otherwise', () => {
    expect(formatHour(new Date(2026, 4, 18, 9, 5))).toBe('9h05');
  });
});

describe('formatShortDate', () => {
  test('writes the day and the short month without a dot', () => {
    expect(formatShortDate(new Date(2026, 4, 17))).toBe('17 mai');
  });
});

describe('formatDueDate', () => {
  const now = new Date(2026, 4, 18, 8, 0);
  const todayLabel = (time: string) => `Hoje, ${time}`;

  test('shows the time when the card is due today', () => {
    expect(formatDueDate(new Date(2026, 4, 18, 14, 30), now, todayLabel)).toBe('Hoje, 14h30');
  });

  test('shows only the date on other days', () => {
    expect(formatDueDate(new Date(2026, 4, 19, 14, 30), now, todayLabel)).toBe('19 mai');
  });

  test('adds the year when the deadline is in another one', () => {
    expect(formatDueDate(new Date(2027, 4, 20, 9, 0), now, todayLabel)).toBe('20 mai 2027');
  });
});
