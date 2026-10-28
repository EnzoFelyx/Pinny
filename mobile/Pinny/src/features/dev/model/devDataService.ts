import { count } from 'drizzle-orm';

import { db } from '@/db/client';
import { boards, cards, checklistItems, columns, folders } from '@/db/schema';
import { boardRepository } from '@/features/board/model/boardRepository';
import { columnRepository } from '@/features/board/model/columnRepository';
import { labelRepository } from '@/features/board/model/labelRepository';
import type { Card } from '@/features/card/model/card.schema';
import { cardRepository } from '@/features/card/model/cardRepository';
import { checklistRepository } from '@/features/card/model/checklistRepository';
import { folderRepository } from '@/features/folders/model/folderRepository';

// Operações de teste da etapa 4, usadas só pela galeria (sai na etapa 5).

export interface DataSummary {
  folders: number;
  boards: number;
  columns: number;
  cards: number;
  checklistItems: number;
}

const HOURS_AHEAD = 5;
const MS_PER_HOUR = 60 * 60 * 1000;

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
  const folder = await folderRepository.create('Pessoal');
  const board = await boardRepository.create(folder.id, 'Minha semana');
  const todo = await columnRepository.create(board.id, 'A fazer');
  await columnRepository.create(board.id, 'Em andamento');
  await columnRepository.create(board.id, 'Concluído');

  const study = await labelRepository.create(board.id, { name: 'Estudos', color: 'lavender' });
  const card = await cardRepository.create({
    columnId: todo.id,
    title: 'Revisar a matéria da prova',
    priority: 'high',
    dueAt: new Date(Date.now() + HOURS_AHEAD * MS_PER_HOUR).toISOString(),
  });
  await labelRepository.setForCard(card.id, [study.id]);
  await checklistRepository.add(card.id, 'Ler o capítulo 3');
  await checklistRepository.add(card.id, 'Fazer os exercícios');
  await cardRepository.create({ columnId: todo.id, title: 'Comprar caderno novo' });
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

// Mesmo efeito de "Apagar todos os meus dados": as pastas levam tudo junto (cascata).
export function clearAllData(): void {
  db.delete(folders).run();
}
