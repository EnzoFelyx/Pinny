import { asc, eq } from 'drizzle-orm';

import { type Database, db } from '@/db/client';
import { attachments } from '@/db/schema';
import { parseRow, parseRows } from '@/db/validation';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/time';

import { type Attachment, attachmentSchema } from './card.schema';

export interface NewAttachmentInput {
  cardId: string;
  // Arquivos já gravados no armazenamento do app (foto sem EXIF de localização e miniatura).
  uri: string;
  thumbnailUri: string;
}

// Fotos anexadas aos cartões. Os arquivos ficam no armazenamento local do app; aqui fica só o
// registro de onde estão.
export interface AttachmentRepository {
  // Do anexo mais antigo para o mais novo.
  listByCard(cardId: string): Promise<Attachment[]>;
  getById(id: string): Promise<Attachment | null>;
  add(input: NewAttachmentInput): Promise<Attachment>;
  remove(id: string): Promise<void>;
  // Recria o registro com os mesmos dados (desfazer a exclusão).
  restore(attachment: Attachment): Promise<void>;
}

export function createAttachmentRepository(database: Database = db): AttachmentRepository {
  return {
    async listByCard(cardId) {
      const rows = database
        .select()
        .from(attachments)
        .where(eq(attachments.cardId, cardId))
        .orderBy(asc(attachments.createdAt))
        .all();
      return parseRows(attachmentSchema, rows, 'attachments');
    },

    async getById(id) {
      const row = database.select().from(attachments).where(eq(attachments.id, id)).get();
      return row ? parseRow(attachmentSchema, row, 'attachments') : null;
    },

    async add({ cardId, uri, thumbnailUri }) {
      const row = database
        .insert(attachments)
        .values({ id: createId(), cardId, uri, thumbnailUri, caption: null, createdAt: nowIso() })
        .returning()
        .get();
      return parseRow(attachmentSchema, row, 'attachments');
    },

    async remove(id) {
      database.delete(attachments).where(eq(attachments.id, id)).run();
    },

    async restore(attachment) {
      database.insert(attachments).values(attachment).run();
    },
  };
}

export const attachmentRepository = createAttachmentRepository();
