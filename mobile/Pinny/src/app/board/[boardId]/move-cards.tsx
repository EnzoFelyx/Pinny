import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { MoveCardsScreen } from '@/features/board/view/MoveCardsScreen';

// Parâmetros vindos da URL (inclusive de deep link): validados antes de usar. Os cartões chegam
// separados por vírgula.
const paramsSchema = z.object({
  boardId: z.uuid(),
  cardIds: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.uuid()).min(1)),
});

export default function MoveCardsRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <MoveCardsScreen boardId={params.data.boardId} cardIds={params.data.cardIds} />;
}
