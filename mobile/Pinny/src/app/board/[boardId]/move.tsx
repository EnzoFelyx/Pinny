import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { MoveBoardScreen } from '@/features/board/view/MoveBoardScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ boardId: z.uuid() });

export default function MoveBoardRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <MoveBoardScreen boardId={params.data.boardId} />;
}
