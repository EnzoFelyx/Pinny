import { createBoardRepository } from '@/features/board/model/boardRepository';
import { createColumnRepository } from '@/features/board/model/columnRepository';
import { createLabelRepository } from '@/features/board/model/labelRepository';
import { createCardRepository } from '@/features/card/model/cardRepository';
import { createChecklistRepository } from '@/features/card/model/checklistRepository';
import { createFolderRepository } from '@/features/folders/model/folderRepository';
import { createPreferencesRepository } from '@/features/settings/model/preferencesRepository';

import { createTestDatabase } from './testDatabase';

// Todos os repositórios sobre o mesmo banco em memória, novo e vazio a cada chamada.
export function createTestRepositories() {
  const database = createTestDatabase();
  return {
    database,
    folders: createFolderRepository(database),
    boards: createBoardRepository(database),
    columns: createColumnRepository(database),
    cards: createCardRepository(database),
    labels: createLabelRepository(database),
    checklist: createChecklistRepository(database),
    preferences: createPreferencesRepository(database),
  };
}

export type TestRepositories = ReturnType<typeof createTestRepositories>;

// Pasta "Pessoal" com o quadro "Semana" e as colunas "Pendentes" e "Concluídas" (vazias).
export async function seedBoard(repositories: TestRepositories) {
  const folder = await repositories.folders.create({ title: 'Pessoal' });
  const board = await repositories.boards.create(folder.id, 'Semana');
  const todo = await repositories.columns.create(board.id, 'Pendentes');
  const done = await repositories.columns.create(board.id, 'Concluídas');
  return { folder, board, todo, done };
}

// Cria os cartões na coluna, na ordem dos títulos, e devolve os ids.
export async function seedCards(
  repositories: TestRepositories,
  columnId: string,
  titles: readonly string[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const title of titles) {
    ids.push((await repositories.cards.create({ columnId, title })).id);
  }
  return ids;
}

// Títulos dos cartões ativos da coluna, na ordem (o que o usuário vê no quadro).
export async function titlesIn(
  repositories: TestRepositories,
  columnId: string,
): Promise<string[]> {
  return (await repositories.cards.listByColumn(columnId)).map((card) => card.title);
}
