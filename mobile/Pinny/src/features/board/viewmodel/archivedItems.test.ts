import { makeBoard, makeBoardCard, makeColumn } from '@/test/factories';

import { EMPTY_CARD_FILTER } from '../model/cardFilter';
import { formatArchivedAt, toArchivedGroups } from './archivedItems';

// Segunda, 18 de maio de 2026, meio-dia (horário do Brasil).
const now = new Date(2026, 4, 18, 12, 0);
const at = (month: number, day: number, hour: number, minute = 0, year = 2026) =>
  new Date(year, month, day, hour, minute).toISOString();

describe('formatArchivedAt', () => {
  test('shows the time when archived today', () => {
    expect(formatArchivedAt(new Date(2026, 4, 18, 10, 20), now)).toBe('Arquivado hoje, 10:20');
  });

  test('shows the time when archived yesterday', () => {
    expect(formatArchivedAt(new Date(2026, 4, 17, 19, 10), now)).toBe('Arquivado ontem, 19:10');
  });

  test('shows only the date on older days', () => {
    expect(formatArchivedAt(new Date(2026, 4, 16, 9, 0), now)).toBe('Arquivado em 16 mai');
  });

  test('adds the year when it is another one', () => {
    expect(formatArchivedAt(new Date(2025, 10, 16, 9, 0), now)).toBe('Arquivado em 16 nov 2025');
  });
});

describe('toArchivedGroups', () => {
  const columns = [
    makeColumn({ id: 'todo', title: 'Pendentes' }),
    makeColumn({ id: 'doing', title: 'Em andamento' }),
    makeColumn({ id: 'done', title: 'Concluídas' }),
  ];
  // Do arquivado mais recente para o mais antigo, como chega do banco.
  const cards = [
    makeBoardCard({
      id: 'a',
      columnId: 'done',
      title: 'Estúdio de música',
      archivedAt: at(4, 18, 10, 20),
      dueAt: at(4, 19, 9),
    }),
    makeBoardCard(
      {
        id: 'b',
        columnId: 'todo',
        title: 'Mercado',
        priority: 'high',
        archivedAt: at(4, 17, 19, 10),
      },
      { checklist: { done: 3, total: 3 } },
    ),
    makeBoardCard({ id: 'c', columnId: 'done', title: 'Academia', archivedAt: at(4, 16, 9) }),
  ];
  const input = {
    data: { board: makeBoard(), columns, cards },
    order: 'recent' as const,
    filter: EMPTY_CARD_FILTER,
    term: '',
    emptyTitle: 'Cartões arquivados',
    emptyMessage: 'Nada por aqui.',
    now,
  };
  const idsBySection = (groups: ReturnType<typeof toArchivedGroups>) =>
    groups.map((group) => [group.title, group.cards.map((card) => card.id)]);

  test('makes one section per origin column, in board order, the most recent first', () => {
    const groups = toArchivedGroups(input);

    expect(idsBySection(groups)).toEqual([
      ['Pendentes', ['b']],
      ['Concluídas', ['a', 'c']],
    ]);
    expect(groups.every((group) => group.isCollapsible)).toBe(true);
  });

  test('puts the oldest first inside each section when asked', () => {
    expect(idsBySection(toArchivedGroups({ ...input, order: 'oldest' }))).toEqual([
      ['Pendentes', ['b']],
      ['Concluídas', ['c', 'a']],
    ]);
  });

  test('shows when the card was archived instead of the deadline', () => {
    const [todo, done] = toArchivedGroups(input);
    const [studio] = done.cards;

    expect(studio.deadline).toBeUndefined();
    expect(studio.archivedText).toBe('Arquivado hoje, 10:20');
    expect(todo.cards[0].archivedText).toBe('Arquivado ontem, 19:10');
    expect(todo.cards[0].accessibilityLabel).toBe(
      'Cartão Mercado, Prioridade alta, 3 de 3 subtarefas concluídas, Arquivado ontem, 19:10',
    );
  });

  test('keeps only the cards found by the search, with the match highlighted', () => {
    const [todo, done] = toArchivedGroups({ ...input, term: 'estudio' });

    expect(todo.cards).toEqual([]);
    expect(done.cards.map((card) => card.id)).toEqual(['a']);
    expect(done.cards[0].titleParts?.[0]).toEqual({ text: 'Estúdio', isMatch: true });
    // "Limpar" continua desmarcando todos, inclusive os escondidos.
    expect(done.allIds).toEqual(['a', 'c']);
  });

  test('applies the filter', () => {
    const groups = toArchivedGroups({
      ...input,
      filter: { ...EMPTY_CARD_FILTER, priorities: ['high'] },
    });

    expect(idsBySection(groups)).toEqual([
      ['Pendentes', ['b']],
      ['Concluídas', []],
    ]);
  });

  test('shows one empty block that does not collapse when nothing is archived', () => {
    const groups = toArchivedGroups({ ...input, data: { ...input.data, cards: [] } });

    expect(groups).toMatchObject([
      { key: 'all', title: 'Cartões arquivados', cards: [], isCollapsible: false },
    ]);
  });
});
