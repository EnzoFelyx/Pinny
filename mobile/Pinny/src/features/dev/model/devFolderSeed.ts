import { db } from '@/db/client';
import { boards } from '@/db/schema';
import { folderRepository } from '@/features/folders/model/folderRepository';
import { createId } from '@/utils/id';

// Pastas grandes para testar o limite de quadros da Início ("+N quadros") e a tela da pasta.
export const LARGE_FOLDER_SIZES = { medium: 8, large: 30 } as const;

// Cria uma pasta com boardCount quadros vazios, numa transação só e com as posições já em ordem.
export async function seedLargeFolder(boardCount: number): Promise<void> {
  const folder = await folderRepository.create({
    title: `Pasta grande (${boardCount})`,
    color: 'babyBlue',
  });
  const now = new Date().toISOString();
  db.transaction((tx) => {
    for (let index = 0; index < boardCount; index += 1) {
      tx.insert(boards)
        .values({
          id: createId(),
          folderId: folder.id,
          title: `Quadro ${index + 1}`,
          position: index + 1,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
  });
}
