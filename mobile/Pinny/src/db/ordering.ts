import { type Placement, type Positioned, resolvePlacement } from '@/utils/position';

// Calcula a nova posição e, se a lista precisou ser renumerada, grava os irmãos.
// Chame dentro de uma transação, com os irmãos em ordem e sem o item que está sendo movido.
export function applyPlacement(
  siblings: readonly Positioned[],
  placement: Placement,
  writePosition: (id: string, position: number) => void,
): number {
  const { position, rebalanced } = resolvePlacement(siblings, placement);
  rebalanced.forEach((item) => writePosition(item.id, item.position));
  return position;
}
