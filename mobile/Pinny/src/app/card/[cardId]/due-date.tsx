import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CardDueDateScreen } from '@/features/card/view/CardDueDateScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function CardDueDateRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <CardDueDateScreen cardId={params.data.cardId} />;
}
