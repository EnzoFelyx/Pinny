import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { NewBoardScreen } from '@/features/folders/view/NewBoardScreen';

// Parâmetros vindos da URL (inclusive de deep link): validados antes de usar.
// title vem da busca da tela da pasta que não achou nada: o campo já começa com ele.
const TITLE_MAX_LENGTH = 120;
const paramsSchema = z.object({
  folderId: z.uuid(),
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
});

export default function NewBoardRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <NewBoardScreen folderId={params.data.folderId} initialTitle={params.data.title} />;
}
