import { and, asc, eq, inArray } from 'drizzle-orm';

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
  // Já entra como a capa do cartão (padrão: não).
  isCover?: boolean;
}

// Fotos anexadas aos cartões. Os arquivos ficam no armazenamento local do app; aqui fica só o
// registro de onde estão.
export interface AttachmentRepository {
  // Do anexo mais antigo para o mais novo.
  listByCard(cardId: string): Promise<Attachment[]>;
  getById(id: string): Promise<Attachment | null>;
  add(input: NewAttachmentInput): Promise<Attachment>;
  remove(id: string): Promise<void>;
  // Recria o registro com os mesmos dados (desfazer a exclusão). Se era a capa e o cartão já tem
  // outra, volta sem ser a capa (no máximo uma por cartão).
  restore(attachment: Attachment): Promise<void>;
  // Id da foto de capa do cartão (null = sem capa).
  coverIdOf(cardId: string): Promise<string | null>;
  // Troca a capa do cartão (null = sem capa).
  setCover(cardId: string, attachmentId: string | null): Promise<void>;
  // Miniatura da capa de cada cartão que tem uma (caminho relativo à pasta do app).
  coverThumbnailsByCards(cardIds: readonly string[]): Promise<Record<string, string>>;
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

    async add({ cardId, uri, thumbnailUri, isCover = false }) {
      const row = database
        .insert(attachments)
        .values({
          id: createId(),
          cardId,
          uri,
          thumbnailUri,
          caption: null,
          isCover,
          createdAt: nowIso(),
        })
        .returning()
        .get();
      return parseRow(attachmentSchema, row, 'attachments');
    },

    async remove(id) {
      database.delete(attachments).where(eq(attachments.id, id)).run();
    },

    async restore(attachment) {
      const hasOtherCover =
        attachment.isCover && (await this.coverIdOf(attachment.cardId)) !== null;
      database
        .insert(attachments)
        .values(hasOtherCover ? { ...attachment, isCover: false } : attachment)
        .run();
    },

    async coverIdOf(cardId) {
      const row = database
        .select({ id: attachments.id })
        .from(attachments)
        .where(and(eq(attachments.cardId, cardId), eq(attachments.isCover, true)))
        .get();
      return row?.id ?? null;
    },

    async setCover(cardId, attachmentId) {
      database.transaction((tx) => {
        tx.update(attachments)
          .set({ isCover: false })
          .where(and(eq(attachments.cardId, cardId), eq(attachments.isCover, true)))
          .run();
        if (attachmentId === null) return;
        tx.update(attachments)
          .set({ isCover: true })
          .where(and(eq(attachments.id, attachmentId), eq(attachments.cardId, cardId)))
          .run();
      });
    },

    async coverThumbnailsByCards(cardIds) {
      if (cardIds.length === 0) return {};
      const rows = database
        .select({ cardId: attachments.cardId, thumbnailUri: attachments.thumbnailUri })
        .from(attachments)
        .where(and(inArray(attachments.cardId, [...cardIds]), eq(attachments.isCover, true)))
        .all();
      return Object.fromEntries(rows.map((row) => [row.cardId, row.thumbnailUri]));
    },
  };
}

export const attachmentRepository = createAttachmentRepository();
