// Tamanhos do Dynamic Type do iOS, do menor ao maior (os mesmos nomes do SwiftUI).
const DYNAMIC_TYPE_SIZES = [
  'xSmall',
  'small',
  'medium',
  'large',
  'xLarge',
  'xxLarge',
  'xxxLarge',
  'accessibility1',
  'accessibility2',
  'accessibility3',
  'accessibility4',
  'accessibility5',
] as const;

export type DynamicTypeSize = (typeof DYNAMIC_TYPE_SIZES)[number];

// Escala de fonte que o React Native informa (fontScale) para cada tamanho, na mesma ordem.
const FONT_SCALES = [0.82, 0.88, 0.95, 1, 1.12, 1.23, 1.35, 1.64, 1.95, 2.35, 2.76, 3.12];

// Um tamanho abaixo do que o usuário escolheu no iPhone: deixa um componente nativo um pouco
// menor sem ignorar a fonte grande do sistema (CLAUDE.md, regra 15).
export function oneSizeSmaller(fontScale: number): DynamicTypeSize {
  const nearest = FONT_SCALES.reduce(
    (best, scale, index) =>
      Math.abs(scale - fontScale) < Math.abs(FONT_SCALES[best] - fontScale) ? index : best,
    0,
  );
  return DYNAMIC_TYPE_SIZES[Math.max(nearest - 1, 0)];
}
