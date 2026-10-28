// Datas são guardadas em ISO 8601 UTC (ordenam corretamente como texto).
export function nowIso(): string {
  return new Date().toISOString();
}
