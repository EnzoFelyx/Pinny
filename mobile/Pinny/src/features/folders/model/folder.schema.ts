import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

import { type FOLDER_ICONS, folders } from '@/db/schema';

export const folderSchema = createSelectSchema(folders);
export type Folder = z.infer<typeof folderSchema>;

export type FolderIcon = (typeof FOLDER_ICONS)[number];
