import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CameraPermissionScreen } from '@/features/card/view/CameraPermissionScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ cardId: z.uuid() });

export default function CameraPermissionRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <CameraPermissionScreen />;
}
