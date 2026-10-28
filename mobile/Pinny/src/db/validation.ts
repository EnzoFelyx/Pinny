import type { z } from 'zod';

// Dado lido do banco que não bate com o schema (ex.: arquivo corrompido ou migração faltando).
export class CorruptedDataError extends Error {
  constructor(
    public readonly entity: string,
    public readonly issues: z.core.$ZodIssue[],
  ) {
    super(`Dados inválidos em "${entity}".`);
    this.name = 'CorruptedDataError';
  }
}

// Todo dado que sai do banco passa por aqui antes de chegar à UI (REGRAS.md, TypeScript).
export function parseRows<Schema extends z.ZodType>(
  schema: Schema,
  rows: unknown[],
  entity: string,
): z.infer<Schema>[] {
  return rows.map((row) => parseRow(schema, row, entity));
}

export function parseRow<Schema extends z.ZodType>(
  schema: Schema,
  row: unknown,
  entity: string,
): z.infer<Schema> {
  const result = schema.safeParse(row);
  if (!result.success) throw new CorruptedDataError(entity, result.error.issues);
  return result.data;
}
