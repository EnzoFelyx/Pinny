import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { NewColumnScreen } from '@/features/board/view/NewColumnScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
// cardId vem quando um cartão foi solto na coluna "Adicionar coluna": ele vai para a coluna nova.
const paramsSchema = z.object({ boardId: z.uuid(), cardId: z.uuid().optional() });

export default function NewColumnRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <NewColumnScreen boardId={params.data.boardId} cardId={params.data.cardId} />;
}
