import { makeBoard, makeBoardCard, makeColumn, makeLabel } from '@/test/factories';

import type { BoardData } from '../model/boardData';
import {
  findCardItems,
  refreshColumnItems,
  toCardItem,
  toColumnItem,
  toColumnItems,
} from './boardItems';

// Segunda, 18 de maio de 2026, 9h (horário do Brasil).
const now = new Date(2026, 4, 18, 9, 0);
const at = (day: number, hour: number) => new Date(2026, 4, day, hour).toISOString();

describe('toCardItem', () => {
  test('shows the cover photo from the app folder', () => {
    const withCover = toCardItem(makeBoardCard({}, { coverPath: 'attachments/a-thumb.jpg' }), now);
    const withoutCover = toCardItem(makeBoardCard(), now);

    expect(withCover.thumbnail).toEqual({ uri: 'file:///documents/attachments/a-thumb.jpg' });
    expect(withoutCover.thumbnail).toBeUndefined();
  });

  test('reads the whole card to the screen reader', () => {
    const item = toCardItem(
      makeBoardCard(
        { title: 'Estudar para a prova', priority: 'high', dueAt: at(18, 14) },
        { labels: [makeLabel({ name: 'Estudos' })], checklist: { done: 2, total: 5 } },
      ),
      now,
    );

    expect(item.accessibilityLabel).toBe(
      'Cartão Estudar para a prova, Etiqueta Estudos, Prioridade alta, ' +
        'prazo Hoje, 14h · Em breve, 2 de 5 subtarefas concluídas',
    );
  });

  test('reads only the title of a card with nothing else', () => {
    const item = toCardItem(makeBoardCard({ title: 'Mercado' }), now);

    expect(item.accessibilityLabel).toBe('Cartão Mercado');
    expect(item).toMatchObject({ deadline: undefined, checklistText: undefined, labels: [] });
  });

  test('writes the deadline state, never only a color', () => {
    const overdue = toCardItem(makeBoardCard({ dueAt: at(17, 10) }), now);
    const soon = toCardItem(makeBoardCard({ dueAt: at(18, 14) }), now);
    const normal = toCardItem(makeBoardCard({ dueAt: at(20, 10) }), now);
    const done = toCardItem(makeBoardCard({ dueAt: at(17, 10), completedAt: at(17, 9) }), now);

    expect(overdue.deadline).toEqual({ status: 'overdue', text: '17 mai · Atrasado' });
    expect(soon.deadline).toEqual({ status: 'soon', text: 'Hoje, 14h · Em breve' });
    expect(normal.deadline).toEqual({ status: 'normal', text: '20 mai' });
    expect(done.deadline).toEqual({ status: 'done', text: '17 mai · Concluído' });
  });

  test('shows the checklist as done/total and reads one subtask in the singular', () => {
    const item = toCardItem(makeBoardCard({}, { checklist: { done: 1, total: 1 } }), now);

    expect(item.checklistText).toBe('1/1');
    expect(item.accessibilityLabel).toContain('1 de 1 subtarefa concluída');
  });
});

describe('toColumnItem', () => {
  test('shows every card and the empty state chosen for the column', () => {
    const column = toColumnItem(
      { column: makeColumn({ title: 'Pendentes' }), cards: [makeBoardCard({ id: 'a' })] },
      now,
      2,
    );

    expect(column).toMatchObject({
      title: 'Pendentes',
      emptyVariant: 2,
      emptyMessage: 'Nada aqui ainda. Bora começar?',
    });
    expect(column.visibleCards).toBe(column.cards);
  });
});

describe('toColumnItems', () => {
  const data = (title: string): BoardData => ({
    board: makeBoard(),
    folderTitle: 'Pessoal',
    columns: [
      {
        column: makeColumn({ id: 'todo' }),
        cards: [makeBoardCard({ id: 'a', title }), makeBoardCard({ id: 'b', title: 'Mercado' })],
      },
      { column: makeColumn({ id: 'done' }), cards: [makeBoardCard({ id: 'x' })] },
    ],
  });

  test('reuses the columns and cards that did not change after a reload', () => {
    const first = toColumnItems(data('Estudar'), {}, [], now);

    const second = toColumnItems(data('Estudar'), {}, first, now);

    expect(second[0]).toBe(first[0]);
    expect(second[1]).toBe(first[1]);
  });

  test('replaces only the card that changed and its column', () => {
    const first = toColumnItems(data('Estudar'), {}, [], now);

    const second = toColumnItems(data('Estudar inglês'), {}, first, now);

    expect(second[0]).not.toBe(first[0]);
    expect(second[0].cards[0].title).toBe('Estudar inglês');
    expect(second[0].cards[1]).toBe(first[0].cards[1]);
    expect(second[1]).toBe(first[1]);
  });

  test('returns no columns without data', () => {
    expect(toColumnItems(null, {}, [], now)).toEqual([]);
  });
});

describe('findCardItems', () => {
  test('returns the cards in the order asked, skipping the ones that are gone', () => {
    const columns = toColumnItems(
      {
        board: makeBoard(),
        folderTitle: 'Pessoal',
        columns: [
          {
            column: makeColumn(),
            cards: [makeBoardCard({ id: 'a' }), makeBoardCard({ id: 'b' })],
          },
        ],
      },
      {},
      [],
      now,
    );

    expect(findCardItems(columns, ['b', 'missing', 'a']).map((card) => card.id)).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('refreshColumnItems', () => {
  // Cartão para as 20h de hoje: normal às 9h do dia anterior, "Em breve" no dia.
  const dueTonight = makeBoardCard({ id: 'due', dueAt: at(18, 20) });
  const data: BoardData = {
    board: makeBoard(),
    folderTitle: 'Pessoal',
    columns: [
      { column: makeColumn({ id: 'todo' }), cards: [dueTonight] },
      { column: makeColumn({ id: 'done' }), cards: [makeBoardCard({ id: 'x' })] },
    ],
  };

  test('keeps the same columns when no deadline changed', () => {
    const columns = toColumnItems(data, {}, [], now);

    expect(refreshColumnItems(data, {}, columns, new Date(2026, 4, 18, 9, 1))).toBe(columns);
  });

  test('redraws only the card whose deadline state changed', () => {
    const columns = toColumnItems(data, {}, [], new Date(2026, 4, 16, 9, 0));

    const refreshed = refreshColumnItems(data, {}, columns, now);

    expect(refreshed).not.toBe(columns);
    expect(refreshed[0].cards[0].deadline?.status).toBe('soon');
    expect(refreshed[1]).toBe(columns[1]);
  });
});
