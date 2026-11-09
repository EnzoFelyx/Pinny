import type { CardRepository } from '@/features/card/model/cardRepository';

import type { Board } from './board.schema';
import type { BoardRepository } from './boardRepository';
import type { ColumnRepository } from './columnRepository';
import type { LabelRepository } from './labelRepository';

interface BoardCopyRepositories {
  boards: BoardRepository;
  columns: ColumnRepository;
  cards: CardRepository;
  labels: LabelRepository;
}

// "Duplicar quadro": cria a cópia logo depois do original, na mesma pasta e sem fixar, com cópias
// das etiquetas, das colunas (na mesma ordem) e dos cartões ativos com checklist. Os anexos não
// vão junto, como no "Duplicar coluna". Devolve o quadro novo.
export async function duplicateBoard(
  board: Board,
  title: string,
  repositories: BoardCopyRepositories,
): Promise<Board> {
  const { boards, columns, cards, labels } = repositories;
  const siblings = await boards.listByFolder(board.folderId);
  const index = siblings.findIndex((item) => item.id === board.id);
  const copy = await boards.create(board.folderId, title);
  await boards.move(copy.id, board.folderId, {
    previousId: board.id,
    nextId: siblings[index + 1]?.id ?? null,
  });

  const labelIdMap = new Map<string, string>();
  for (const label of await labels.listByBoard(board.id)) {
    const labelCopy = await labels.create(copy.id, { name: label.name, color: label.color });
    labelIdMap.set(label.id, labelCopy.id);
  }

  for (const column of await columns.listByBoard(board.id)) {
    const columnCopy = await columns.create(copy.id, column.title);
    await cards.copyToColumn(column.id, columnCopy.id, labelIdMap);
  }
  return copy;
}
