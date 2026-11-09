import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { ArchivedCardsScreen } from '@/features/board/view/ArchivedCardsScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ boardId: z.uuid() });

export default function ArchivedCardsRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <ArchivedCardsScreen boardId={params.data.boardId} />;
}
