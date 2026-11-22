import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { ArchivedCardScreen } from '@/features/board/view/ArchivedCardScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function ArchivedCardRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <ArchivedCardScreen cardId={params.data.cardId} />;
}
