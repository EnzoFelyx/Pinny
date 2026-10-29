import { count } from 'drizzle-orm';

import { db } from '@/db/client';
import { boards, cards, checklistItems, columns, folders, preferences } from '@/db/schema';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import type { Card } from '@/features/card/model/card.schema';
import { cardRepository } from '@/features/card/model/cardRepository';
import { checklistRepository } from '@/features/card/model/checklistRepository';
import { folderRepository } from '@/features/folders/model/folderRepository';

// Operações de teste, usadas só pela galeria de desenvolvimento.

export interface DataSummary {
  folders: number;
  boards: number;
  columns: number;
  cards: number;
  checklistItems: number;
}

const HOURS_AHEAD = 5;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// Data relativa a hoje (negativo = no passado), para mostrar os estados de prazo.
const daysFromNow = (days: number) => new Date(Date.now() + days * MS_PER_DAY).toISOString();

export function getDataSummary(): DataSummary {
  const total = (table: typeof folders | typeof boards | typeof columns | typeof cards) =>
    db.select({ value: count() }).from(table).get()?.value ?? 0;

  return {
    folders: total(folders),
    boards: total(boards),
    columns: total(columns),
    cards: total(cards),
    checklistItems: db.select({ value: count() }).from(checklistItems).get()?.value ?? 0,
  };
}

export async function seedSampleBoard(): Promise<void> {
  const folder = await folderRepository.create({ title: 'Pessoal', icon: 'heart', color: 'mint' });
  const board = await boardRepository.create(folder.id, 'Minha semana');
  const todo = await columnRepository.create(board.id, 'A fazer');
  const doing = await columnRepository.create(board.id, 'Em andamento');
  await columnRepository.create(board.id, 'Concluído');

  const study = await labelRepository.create(board.id, { name: 'Estudos', color: 'lavender' });
  const home = await labelRepository.create(board.id, { name: 'Casa', color: 'mint' });
  const work = await labelRepository.create(board.id, { name: 'Trabalho', color: 'babyBlue' });

  // Coluna "A fazer" com cartões variados (alturas diferentes) para testar o arraste.
  const exam = await cardRepository.create({
    columnId: todo.id,
    title: 'Revisar a matéria da prova',
    priority: 'high',
    dueAt: new Date(Date.now() + HOURS_AHEAD * MS_PER_HOUR).toISOString(),
  });
  await labelRepository.setForCard(exam.id, [study.id]);
  await checklistRepository.add(exam.id, 'Ler o capítulo 3');
  await checklistRepository.add(exam.id, 'Fazer os exercícios');

  await cardRepository.create({ columnId: todo.id, title: 'Comprar caderno novo' });

  const groceries = await cardRepository.create({
    columnId: todo.id,
    title: 'Fazer a lista do mercado da semana',
    priority: 'low',
    dueAt: daysFromNow(3),
  });
  await labelRepository.setForCard(groceries.id, [home.id]);

  const report = await cardRepository.create({
    columnId: todo.id,
    title: 'Enviar o relatório do mês',
    priority: 'medium',
    dueAt: daysFromNow(-1),
  });
  await labelRepository.setForCard(report.id, [work.id]);

  const plants = await cardRepository.create({ columnId: todo.id, title: 'Regar as plantas' });
  await labelRepository.setForCard(plants.id, [home.id]);

  const slides = await cardRepository.create({
    columnId: doing.id,
    title: 'Montar os slides da apresentação',
    priority: 'medium',
    dueAt: daysFromNow(2),
  });
  await labelRepository.setForCard(slides.id, [work.id, study.id]);
  await checklistRepository.add(slides.id, 'Esboço');
}

// Primeiro cartão do primeiro quadro, para os botões de mover e excluir.
export async function findFirstCard(): Promise<{ card: Card; nextColumnId: string } | null> {
  const [folder] = await folderRepository.list();
  if (!folder) return null;
  const [board] = await boardRepository.listByFolder(folder.id);
  if (!board) return null;

  const boardColumns = await columnRepository.listByBoard(board.id);
  for (const [index, column] of boardColumns.entries()) {
    const [card] = await cardRepository.listByColumn(column.id);
    if (card) {
      const nextColumn = boardColumns[(index + 1) % boardColumns.length];
      return { card, nextColumnId: nextColumn?.id ?? column.id };
    }
  }
  return null;
}

// Mesmo efeito de "Apagar todos os meus dados": as pastas levam tudo junto (cascata), e as
// preferências voltam ao padrão (ex.: a dica do chacoalhar aparece de novo).
export function clearAllData(): void {
  db.delete(folders).run();
  db.delete(preferences).run();
}

const SAMPLE_TITLES = [
  'Ligar para a dentista',
  'Organizar a mesa de trabalho',
  'Ler 20 páginas do livro',
  'Planejar o fim de semana',
  'Responder os e-mails pendentes',
  'Separar roupas para doar',
  'Estudar o capítulo novo',
  'Marcar café com a Ana',
] as const;
const SAMPLE_PRIORITIES = [null, 'low', 'medium', 'high'] as const;
const SAMPLE_MAX_DAYS_AHEAD = 7;

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)] as T;

// Cartão de exemplo para testar a coluna crescendo. Provisório: o "Adicionar cartão" de verdade
// (formulário) chega na etapa 7.
export async function createSampleCard(columnId: string): Promise<Card> {
  const hasDueDate = Math.random() < 0.5;
  return cardRepository.create({
    columnId,
    title: pick(SAMPLE_TITLES),
    priority: pick(SAMPLE_PRIORITIES),
    dueAt: hasDueDate ? daysFromNow(Math.round(Math.random() * SAMPLE_MAX_DAYS_AHEAD)) : null,
  });
}
