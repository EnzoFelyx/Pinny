import type { CardSnapshot } from '@/features/card/model/card.schema';
import type { CardRepository } from '@/features/card/model/cardRepository';

import type { Column } from './board.schema';
import type { ColumnRepository } from './columnRepository';

// Retrato de uma coluna excluída: ela e todos os cartões dela, para o "Desfazer" recriar tudo.
export interface ColumnSnapshot {
  column: Column;
  cards: CardSnapshot[];
}

interface ColumnRemovalRepositories {
  columns: ColumnRepository;
  cards: CardRepository;
}

// Exclui a coluna e os cartões dela, devolvendo o retrato. null = a coluna não existe mais.
export async function removeColumnWithCards(
  columnId: string,
  { columns, cards }: ColumnRemovalRepositories,
): Promise<ColumnSnapshot | null> {
  const column = await columns.getById(columnId);
  if (!column) return null;
  const cardSnapshots = await cards.removeByColumn(columnId);
  await columns.remove(columnId);
  return { column, cards: cardSnapshots };
}

// Recria a coluna e os cartões exatamente como eram (mesmos ids, nomes e posições).
export async function restoreColumnWithCards(
  { column, cards: cardSnapshots }: ColumnSnapshot,
  { columns, cards }: ColumnRemovalRepositories,
): Promise<void> {
  await columns.restore(column);
  for (const snapshot of cardSnapshots) await cards.restore(snapshot);
}
