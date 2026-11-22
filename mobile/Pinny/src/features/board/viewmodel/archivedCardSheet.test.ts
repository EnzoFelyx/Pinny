import type { ChecklistItem } from '@/features/card/model/card.schema';
import type { CardDetail } from '@/features/card/model/cardDetail';
import { makeBoard, makeCard, makeColumn, makeLabel } from '@/test/factories';

import { toArchivedCardSheet } from './archivedCardSheet';
import { formatArchivedValue } from './archivedItems';

// Segunda, 18 de maio de 2026, meio-dia (horário do Brasil).
const now = new Date(2026, 4, 18, 12, 0);
const iso = (day: number, hour: number, minute = 0) =>
  new Date(2026, 4, day, hour, minute).toISOString();

const step = (id: string, isDone: boolean): ChecklistItem => ({
  id,
  cardId: 'card-1',
  text: id,
  isDone,
  position: 1,
  createdAt: iso(1, 9),
  updatedAt: iso(1, 9),
});

const detailOf = (card: Partial<CardDetail['card']>, extras: Partial<CardDetail> = {}) => ({
  card: makeCard({ title: 'Enviar proposta', archivedAt: iso(18, 10, 20), ...card }),
  column: makeColumn({ title: 'Em andamento' }),
  board: makeBoard({ id: 'board-1' }),
  folderTitle: 'Trabalho',
  labels: [],
  boardLabels: [],
  checklist: [],
  attachments: [],
  ...extras,
});

describe('formatArchivedValue', () => {
  test('writes today and yesterday with the time, other days with the date', () => {
    expect(formatArchivedValue(new Date(2026, 4, 18, 10, 20), now)).toBe('Hoje, 10:20');
    expect(formatArchivedValue(new Date(2026, 4, 17, 19, 10), now)).toBe('Ontem, 19:10');
    expect(formatArchivedValue(new Date(2026, 4, 16, 9, 0), now)).toBe('16 mai');
  });
});

describe('toArchivedCardSheet', () => {
  test('shows the origin column and when it was archived, and names the column on the button', () => {
    const sheet = toArchivedCardSheet(detailOf({}), now);

    expect(sheet.rows.map((row) => [row.label, row.value])).toEqual([
      ['Coluna de origem', 'Em andamento'],
      ['Arquivado', 'Hoje, 10:20'],
    ]);
    expect(sheet.rows[0].accessibilityLabel).toBe('Coluna de origem: Em andamento');
    expect(sheet.unarchiveLabel).toBe('Desarquivar em Em andamento');
    expect(sheet.boardId).toBe('board-1');
  });

  test('adds the deadline and the checklist when the card has them', () => {
    const sheet = toArchivedCardSheet(
      detailOf(
        { dueAt: iso(18, 10) },
        { checklist: [step('a', true), step('b', true), step('c', true)] },
      ),
      now,
    );

    expect(sheet.rows.map((row) => [row.kind, row.value])).toEqual([
      ['column', 'Em andamento'],
      ['archived', 'Hoje, 10:20'],
      ['due', 'Hoje, 18 mai · 10:00'],
      ['checklist', '3 de 3'],
    ]);
  });

  test('brings labels, priority and description, and hides an empty description', () => {
    const full = toArchivedCardSheet(
      detailOf(
        { priority: 'high', description: 'Escopo e valores.' },
        { labels: [makeLabel({ id: 'l1', name: 'Trabalho' })] },
      ),
      now,
    );
    const blank = toArchivedCardSheet(detailOf({ description: '   ' }), now);

    expect(full).toMatchObject({
      title: 'Enviar proposta',
      description: 'Escopo e valores.',
      priority: 'high',
      labels: [{ id: 'l1', name: 'Trabalho' }],
    });
    expect(blank.description).toBeNull();
  });
});
