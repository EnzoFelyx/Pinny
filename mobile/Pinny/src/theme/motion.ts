// Valores iniciais: ajustar no aparelho, em build de release.
// Com "Reduzir movimento" ligado, a inclinação e a mola do arraste são desligadas.

export const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Mola do cartão assentando na vaga ao ser solto. Passa ~4% do ponto antes de parar
// (amortecimento 0,71; com damping 18 eram ~9%, o autor pediu metade do quique).
export const dragSpring = {
  damping: 21,
  stiffness: 220,
} as const;

// Cartão segurado (Figma "Quadro · Arrastar cartão"): levemente girado, maior e elevado.
export const dragLift = {
  rotationDeg: -5,
  scale: 1.03,
} as const;

// Tempo segurando o cartão até o arraste começar (antes disso, o dedo rola a coluna).
export const DRAG_ACTIVATION_MS = 300;

// Rolagem automática quando o cartão chega perto da borda (da coluna ou da tela).
export const autoScroll = {
  // Distância da borda, em pontos, em que a rolagem começa: em cima e embaixo da coluna.
  edge: 60,
  // Nas bordas esquerda e direita da tela, para o quadro rolar para os lados (50% maior, pedido
  // do autor em 2026-10-30).
  boardEdge: 90,
  // Pontos por quadro na velocidade máxima (bem na borda).
  maxSpeed: 12,
  // Velocidade máxima do quadro para os lados (ajustada pelo autor no aparelho em 2026-10-30).
  boardMaxSpeed: 16,
} as const;

// Puxar a coluna para baixo e segurar para excluir (alerta de confirmação no fim).
export const pullToDelete = {
  // Quanto puxar, em pontos, para começar a contar.
  distance: 90,
  // Tempo segurando puxado até pedir a confirmação.
  holdMs: 500,
} as const;

// Skeleton loading (estilo do YouTube): uma faixa de brilho de shimmerBandWidth pontos atravessa a
// tela a cada shimmerMs, em velocidade constante. minDurationMs segura o skeleton na tela por um
// tempo mínimo; em 0 (decisão do autor, 2026-11-02), ele aparece só enquanto os dados não chegam.
export const skeleton = {
  minDurationMs: 0,
  shimmerMs: 1400,
  shimmerBandWidth: 160,
  // Troca de filtro no quadro: o skeleton só aparece se a montagem passar deste tempo (trocas
  // rápidas não piscam).
  filterDelayMs: 150,
} as const;
