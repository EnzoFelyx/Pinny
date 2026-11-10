// Variações do estado vazio das colunas (ilustração + frase). Colunas vazias ao mesmo tempo não
// repetem a variação enquanto houver alguma livre; da sexta em diante, repete.

export const EMPTY_VARIANTS = [0, 1, 2, 3, 4] as const;
export type EmptyVariant = (typeof EMPTY_VARIANTS)[number];

export type EmptyVariantMap = Readonly<Record<string, EmptyVariant>>;

// Quem já tinha variação fica com ela (não troca a cada recarga); cada coluna vazia nova sorteia
// entre as variações livres, ou entre todas quando as 5 já estão em uso. Colunas que deixaram de
// estar vazias saem do mapa e liberam a variação delas.
export function assignEmptyVariants(
  emptyColumnIds: readonly string[],
  previous: EmptyVariantMap,
  random: () => number = Math.random,
): Record<string, EmptyVariant> {
  const result: Record<string, EmptyVariant> = {};
  for (const id of emptyColumnIds) {
    const kept = previous[id];
    if (kept !== undefined) result[id] = kept;
  }
  for (const id of emptyColumnIds) {
    if (result[id] !== undefined) continue;
    const used = new Set(Object.values(result));
    const free = EMPTY_VARIANTS.filter((variant) => !used.has(variant));
    const pool = free.length > 0 ? free : EMPTY_VARIANTS;
    result[id] = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  }
  return result;
}
