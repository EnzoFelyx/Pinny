import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { NewColumnScreen } from '@/features/board/view/NewColumnScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ boardId: z.uuid() });

export default function NewColumnRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <NewColumnScreen boardId={params.data.boardId} />;
}
