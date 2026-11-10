// Pilha do arraste em lote: quem aparece embaixo do cartão segurado e com que ângulo. Funções
// puras (worklets, rodam na UI thread durante o gesto).

// Os outros cartões à mostra na pilha, na ordem do quadro, sem o segurado (no máximo
// maxVisible - 1: o segurado é o de cima).
export function stackedIds(
  heldId: string,
  selectedIds: readonly string[],
  maxVisible: number,
): string[] {
  'worklet';
  return selectedIds.filter((id) => id !== heldId).slice(0, Math.max(0, maxVisible - 1));
}

// Ângulo do cartão na posição `depth` da pilha (0 = o segurado), alternando os lados com `step`
// de diferença: base -5° e step 3° dão -5°, -2°, -8°, +1°, -11°.
export function stackRotation(depth: number, baseDeg: number, stepDeg: number): number {
  'worklet';
  if (depth <= 0) return baseDeg;
  const ring = Math.ceil(depth / 2);
  const side = depth % 2 === 1 ? 1 : -1;
  return baseDeg + side * ring * stepDeg;
}
