import type { CardRepository } from '@/features/card/model/cardRepository';

import type { Column } from './board.schema';
import type { ColumnRepository } from './columnRepository';

interface ColumnCopyRepositories {
  columns: ColumnRepository;
  cards: CardRepository;
}

// "Duplicar coluna": cria a cópia logo depois da original (antes de nextColumnId) com cópias dos
// cartões ativos, na mesma ordem. Devolve a coluna nova.
export async function duplicateColumn(
  column: Column,
  title: string,
  nextColumnId: string | null,
  { columns, cards }: ColumnCopyRepositories,
): Promise<Column> {
  const copy = await columns.create(column.boardId, title);
  await columns.move(copy.id, { previousId: column.id, nextId: nextColumnId });
  await cards.copyToColumn(column.id, copy.id);
  return copy;
}
