import type { Board } from './board.schema';
import type { BoardRepository } from './boardRepository';
import type { ColumnRepository } from './columnRepository';

interface BoardCreationRepositories {
  boards: BoardRepository;
  columns: ColumnRepository;
}

// Cria o quadro no fim da pasta já com as colunas iniciais, vazias e nesta ordem.
export async function createBoardWithColumns(
  folderId: string,
  title: string,
  columnTitles: readonly string[],
  { boards, columns }: BoardCreationRepositories,
): Promise<Board> {
  const board = await boards.create(folderId, title);
  for (const columnTitle of columnTitles) await columns.create(board.id, columnTitle);
  return board;
}
