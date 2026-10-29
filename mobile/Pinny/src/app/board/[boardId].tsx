import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { BoardScreen } from '@/features/board/view/BoardScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ boardId: z.uuid() });

export default function BoardRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <BoardScreen boardId={params.data.boardId} />;
}
