import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { FolderScreen } from '@/features/folders/view/FolderScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ folderId: z.uuid() });

export default function FolderRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <FolderScreen folderId={params.data.folderId} />;
}
