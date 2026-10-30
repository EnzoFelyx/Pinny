import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { MoveCardScreen } from '@/features/board/view/MoveCardScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function MoveCardRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <MoveCardScreen cardId={params.data.cardId} />;
}
