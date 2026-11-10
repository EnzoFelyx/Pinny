import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { NewColumnScreen } from '@/features/board/view/NewColumnScreen';

// Parâmetro vindo da URL (inclusive de deep link): validado antes de usar.
// cardIds vem quando cartões foram soltos na coluna "Adicionar coluna" (um só ou a pilha do
// arraste em lote, separados por vírgula): eles vão para a coluna nova, nessa ordem.
const paramsSchema = z.object({
  boardId: z.uuid(),
  cardIds: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.uuid()).min(1))
    .optional(),
});

export default function NewColumnRoute() {
  const params = paramsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <NewColumnScreen boardId={params.data.boardId} cardIds={params.data.cardIds} />;
}
