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
  rotationDeg: 3,
  scale: 1.03,
} as const;

// Tempo segurando o cartão até o arraste começar (antes disso, o dedo rola a coluna).
export const DRAG_ACTIVATION_MS = 300;

// Rolagem automática da coluna quando o cartão chega perto da borda.
export const autoScroll = {
  // Distância da borda, em pontos, em que a rolagem começa.
  edge: 60,
  // Pontos por quadro na velocidade máxima (bem na borda).
  maxSpeed: 12,
} as const;

// Puxar a coluna para baixo e segurar para excluir (alerta de confirmação no fim).
export const pullToDelete = {
  // Quanto puxar, em pontos, para começar a contar.
  distance: 90,
  // Tempo segurando puxado até pedir a confirmação.
  holdMs: 1000,
} as const;
