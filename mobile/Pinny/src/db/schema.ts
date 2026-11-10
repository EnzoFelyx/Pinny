import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Estrutura do banco local (fonte única: os tipos e os schemas Zod derivam daqui).
// Datas em texto ISO 8601 UTC, que ordena corretamente como texto.
// "position" é decimal: mover um item grava só ele (ver model/position.ts).

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export const LABEL_COLORS = ['lavender', 'mint', 'peach', 'babyBlue', 'butter'] as const;
// Ícones que o usuário pode escolher para a pasta (tela de criar pasta, etapa 8).
export const FOLDER_ICONS = [
  'folder',
  'briefcase',
  'heart',
  'lightbulb',
  'book',
  'plane',
  'house',
  'star',
] as const;

const timestamps = {
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
};

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  // Escolhidos pelo usuário ao criar a pasta (exceção à regra "sem personalizar cores" da v1).
  icon: text('icon', { enum: FOLDER_ICONS }).notNull().default('folder'),
  color: text('color', { enum: LABEL_COLORS }).notNull().default('lavender'),
  position: real('position').notNull(),
  // Quando a pasta foi fixada no topo da Início (null = não fixada). As fixadas vêm primeiro, da
  // fixada mais recente para a mais antiga.
  pinnedAt: text('pinned_at'),
  ...timestamps,
});

export const boards = sqliteTable(
  'boards',
  {
    id: text('id').primaryKey(),
    folderId: text('folder_id')
      .notNull()
      .references(() => folders.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: real('position').notNull(),
    // Quando o quadro foi fixado na Início (null = não fixado). A pasta mostra primeiro os
    // fixados, do mais recente para o mais antigo, e completa com os outros.
    pinnedAt: text('pinned_at'),
    ...timestamps,
  },
  (table) => [index('boards_folder_idx').on(table.folderId, table.position)],
);

export const columns = sqliteTable(
  'columns',
  {
    id: text('id').primaryKey(),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: real('position').notNull(),
    ...timestamps,
  },
  (table) => [index('columns_board_idx').on(table.boardId, table.position)],
);

export const cards = sqliteTable(
  'cards',
  {
    id: text('id').primaryKey(),
    columnId: text('column_id')
      .notNull()
      .references(() => columns.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    priority: text('priority', { enum: PRIORITIES }),
    dueAt: text('due_at'),
    completedAt: text('completed_at'),
    archivedAt: text('archived_at'),
    position: real('position').notNull(),
    ...timestamps,
  },
  (table) => [
    index('cards_column_idx').on(table.columnId, table.position),
    index('cards_due_idx').on(table.dueAt),
  ],
);

export const labels = sqliteTable(
  'labels',
  {
    id: text('id').primaryKey(),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color', { enum: LABEL_COLORS }).notNull(),
    ...timestamps,
  },
  (table) => [index('labels_board_idx').on(table.boardId)],
);

export const cardLabels = sqliteTable(
  'card_labels',
  {
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.cardId, table.labelId] })],
);

export const checklistItems = sqliteTable(
  'checklist_items',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
    position: real('position').notNull(),
    ...timestamps,
  },
  (table) => [index('checklist_card_idx').on(table.cardId, table.position)],
);

// As fotos em si chegam na etapa 7; aqui fica só o registro do anexo.
export const attachments = sqliteTable(
  'attachments',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    uri: text('uri').notNull(),
    thumbnailUri: text('thumbnail_uri').notNull(),
    caption: text('caption'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('attachments_card_idx').on(table.cardId)],
);

// Preferências do app (chave e valor em texto), só no aparelho. Ex.: se a dica do chacoalhar
// já foi mostrada. Entra em "Apagar todos os meus dados".
export const preferences = sqliteTable('preferences', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
