// Valores iniciais: ajustar no aparelho, em build de release.
// Com "Reduzir movimento" ligado, a inclinação e a mola do arraste são desligadas.

export const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const dragSpring = {
  damping: 18,
  stiffness: 220,
} as const;

export const dragLift = {
  rotationDeg: 3,
  scale: 1.03,
} as const;
