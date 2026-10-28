// Ordenação por posição decimal: mover um item grava só ele, com o ponto médio entre os vizinhos.
// Quando o vão entre dois vizinhos fica pequeno demais, a lista é renumerada (1, 2, 3...).

export const POSITION_STEP = 1;
// Bem acima da precisão de um double: sobram ~30 inserções seguidas no mesmo vão antes de renumerar.
export const MIN_POSITION_GAP = 1e-9;

export interface Positioned {
  id: string;
  position: number;
}

// Onde o item vai ficar: entre o anterior e o próximo.
// Só previousId = fim depois dele; só nextId = antes dele; nenhum dos dois = fim da lista.
export interface Placement {
  previousId?: string | null;
  nextId?: string | null;
}

export interface PlacementResult {
  position: number;
  // Vazio no caso comum; preenchido só quando a lista precisa ser renumerada.
  rebalanced: Positioned[];
}

export function positionAtEnd(siblings: readonly Positioned[]): number {
  const last = siblings.at(-1);
  return last ? last.position + POSITION_STEP : POSITION_STEP;
}

export function positionBetween(previous?: number, next?: number): number {
  if (previous === undefined) return next === undefined ? POSITION_STEP : next - POSITION_STEP;
  if (next === undefined) return previous + POSITION_STEP;
  return (previous + next) / 2;
}

export function renumber(siblings: readonly Positioned[]): Positioned[] {
  return siblings.map((item, index) => ({ id: item.id, position: (index + 1) * POSITION_STEP }));
}

// siblings: itens da lista de destino, em ordem, SEM o item que está sendo movido.
export function resolvePlacement(
  siblings: readonly Positioned[],
  placement: Placement,
): PlacementResult {
  if (!placement.previousId && !placement.nextId) {
    return { position: positionAtEnd(siblings), rebalanced: [] };
  }

  const previous = findNeighbor(siblings, placement.previousId);
  const next = findNeighbor(siblings, placement.nextId);

  const hasRoom =
    previous === undefined || next === undefined || next - previous >= MIN_POSITION_GAP;
  if (hasRoom) return { position: positionBetween(previous, next), rebalanced: [] };

  const rebalanced = renumber(siblings);
  return {
    position: positionBetween(
      findNeighbor(rebalanced, placement.previousId),
      findNeighbor(rebalanced, placement.nextId),
    ),
    rebalanced,
  };
}

function findNeighbor(siblings: readonly Positioned[], id?: string | null): number | undefined {
  if (!id) return undefined;
  const neighbor = siblings.find((item) => item.id === id);
  if (!neighbor) throw new Error(`Item vizinho "${id}" não está na lista de destino.`);
  return neighbor.position;
}
