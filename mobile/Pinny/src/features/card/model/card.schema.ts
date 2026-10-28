import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { attachments, cards, checklistItems } from '@/db/schema';

export const cardSchema = createSelectSchema(cards);
export type Card = z.infer<typeof cardSchema>;

export const checklistItemSchema = createSelectSchema(checklistItems);
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const attachmentSchema = createSelectSchema(attachments);
export type Attachment = z.infer<typeof attachmentSchema>;

// Tudo o que pertence a um cartão: guardado ao excluir, para o "Desfazer" restaurar igual.
export const cardSnapshotSchema = z.object({
  card: cardSchema,
  labelIds: z.array(z.string()),
  checklist: z.array(checklistItemSchema),
  attachments: z.array(attachmentSchema),
});
export type CardSnapshot = z.infer<typeof cardSnapshotSchema>;
