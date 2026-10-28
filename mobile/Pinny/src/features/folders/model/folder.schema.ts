import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

import { folders } from '@/db/schema';

export const folderSchema = createSelectSchema(folders);
export type Folder = z.infer<typeof folderSchema>;
