import type { Placement } from '@/utils/position';

// Funções puras do arraste de cartões. Marcadas como 'worklet' para rodar na UI thread,
// a cada quadro do gesto, sem passar pelo React.

export type Heights = Readonly<Record<string, number>>;
export type Offsets = Readonly<Record<string, number>>;

// Devolve uma nova lista com o item de "from" levado para "to".
export function moveIndex<T>(items: readonly T[], from: number, to: number): T[] {
  'worklet';
  const result = [...items];
  const [moved] = result.splice(from, 1);
  if (moved === undefined) return result;
  result.splice(to, 0, moved);
  return result;
}

// Posição vertical (topo) de cada cartão: a soma das alturas de quem vem antes, com o espaço entre eles.
// Cartão ainda não medido usa a altura estimada.
export function computeOffsets(
  ids: readonly string[],
  heights: Heights,
  gap: number,
  estimatedHeight: number,
): Record<string, number> {
  'worklet';
  const offsets: Record<string, number> = {};
  let top = 0;
  for (const id of ids) {
    offsets[id] = top;
    top += (heights[id] ?? estimatedHeight) + gap;
  }
  return offsets;
}

// Altura total da lista (para o conteúdo rolável da coluna).
export function totalHeight(
  ids: readonly string[],
  heights: Heights,
  gap: number,
  estimatedHeight: number,
): number {
  'worklet';
  let total = 0;
  for (const id of ids) total += (heights[id] ?? estimatedHeight) + gap;
  return Math.max(0, total - gap);
}

// Vaga em que o cartão arrastado deve ficar, a partir do centro dele (centerY): quantos dos
// outros cartões têm o meio acima desse centro. Ele troca de lugar com um vizinho ao passar
// do meio desse vizinho, e o vizinho trocado muda de meio, o que evita "tremer" na divisa.
export function indexFromCenter(
  centerY: number,
  draggedId: string,
  ids: readonly string[],
  offsets: Offsets,
  heights: Heights,
  estimatedHeight: number,
): number {
  'worklet';
  let index = 0;
  for (const id of ids) {
    if (id === draggedId) continue;
    const middle = (offsets[id] ?? 0) + (heights[id] ?? estimatedHeight) / 2;
    if (middle < centerY) index += 1;
  }
  return index;
}

// Vizinhos do cartão na ordem final, no formato que o cardRepository.move espera.
export function toPlacement(ids: readonly string[], movedId: string): Placement {
  const index = ids.indexOf(movedId);
  return {
    previousId: index > 0 ? ids[index - 1] : null,
    nextId: index >= 0 && index < ids.length - 1 ? ids[index + 1] : null,
  };
}

// Coluna sob o ponto x, contado do início da primeira coluna (pitch = largura + espaço). A divisa
// entre duas colunas fica no meio do espaço entre elas. Fora do quadro, vale a coluna da ponta.
export function columnIndexAt(x: number, pitch: number, gap: number, count: number): number {
  'worklet';
  if (count === 0 || pitch <= 0) return -1;
  const index = Math.floor((x + gap / 2) / pitch);
  return Math.max(0, Math.min(count - 1, index));
}

// Vizinhos para levar o cartão ao início ou ao fim de uma coluna ("Mover para...").
export function edgePlacement(
  ids: readonly string[],
  movedId: string,
  edge: 'start' | 'end',
): Placement {
  const others = ids.filter((id) => id !== movedId);
  return edge === 'start'
    ? { previousId: null, nextId: others[0] ?? null }
    : { previousId: others.at(-1) ?? null, nextId: null };
}
