import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

import { boards, columns, labels } from '@/db/schema';

export const boardSchema = createSelectSchema(boards);
export type Board = z.infer<typeof boardSchema>;

export const columnSchema = createSelectSchema(columns);
export type Column = z.infer<typeof columnSchema>;

export const labelSchema = createSelectSchema(labels);
export type Label = z.infer<typeof labelSchema>;
