import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CardLabelsScreen } from '@/features/card/view/CardLabelsScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function CardLabelsRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <CardLabelsScreen cardId={params.data.cardId} />;
}
