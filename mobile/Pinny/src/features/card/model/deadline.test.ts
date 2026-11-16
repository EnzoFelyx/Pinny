import { getDeadlineStatus } from './deadline';

const now = new Date('2026-05-18T12:00:00.000Z');

describe('getDeadlineStatus', () => {
  test('is done for a completed card, even with a past due date', () => {
    const card = { dueAt: '2026-05-01T12:00:00.000Z', completedAt: '2026-05-02T12:00:00.000Z' };

    expect(getDeadlineStatus(card, now)).toBe('done');
  });

  test('is null for a card with no due date', () => {
    expect(getDeadlineStatus({ dueAt: null, completedAt: null }, now)).toBeNull();
  });

  test('is null when the due date is not a valid date', () => {
    expect(getDeadlineStatus({ dueAt: 'amanhã', completedAt: null }, now)).toBeNull();
  });

  test('is overdue when the due date has passed', () => {
    const card = { dueAt: '2026-05-18T11:59:00.000Z', completedAt: null };

    expect(getDeadlineStatus(card, now)).toBe('overdue');
  });

  test('is soon up to 24 hours before the due date', () => {
    const inOneHour = { dueAt: '2026-05-18T13:00:00.000Z', completedAt: null };
    const inExactly24Hours = { dueAt: '2026-05-19T12:00:00.000Z', completedAt: null };

    expect(getDeadlineStatus(inOneHour, now)).toBe('soon');
    expect(getDeadlineStatus(inExactly24Hours, now)).toBe('soon');
  });

  test('is normal when the due date is more than 24 hours away', () => {
    const card = { dueAt: '2026-05-19T12:01:00.000Z', completedAt: null };

    expect(getDeadlineStatus(card, now)).toBe('normal');
  });
});
