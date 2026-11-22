import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CardPhotoScreen } from '@/features/card/view/CardPhotoScreen';

// Parâmetros vindos da URL (inclusive de deep link): validados antes de usar.
const paramsSchema = z.object({ cardId: z.uuid(), attachmentId: z.uuid() });

export default function CardPhotoRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <CardPhotoScreen attachmentId={params.data.attachmentId} />;
}
