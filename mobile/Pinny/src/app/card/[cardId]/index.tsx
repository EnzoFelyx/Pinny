import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CardDetailScreen } from '@/features/card/view/CardDetailScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function CardDetailRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <CardDetailScreen cardId={params.data.cardId} />;
}
