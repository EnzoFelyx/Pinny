import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { RenameFolderScreen } from '@/features/folders/view/RenameFolderScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
const paramsSchema = z.object({ folderId: z.uuid() });

export default function RenameFolderRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <RenameFolderScreen folderId={params.data.folderId} />;
}
