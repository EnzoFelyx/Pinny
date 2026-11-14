import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { NewLabelScreen } from '@/features/card/view/NewLabelScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function NewLabelRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <NewLabelScreen cardId={params.data.cardId} />;
}
