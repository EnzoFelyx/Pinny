// Nomes PostScript dos arquivos registrados no plugin expo-font (app.json).
export const fontFamily = {
  medium: 'Nunito-Medium',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
} as const;

export const LINE_HEIGHT_RATIO = 1.35;

interface TextScaleEntry {
  size: number;
  family: (typeof fontFamily)[keyof typeof fontFamily];
}

// Cada entrada vira uma classe text-<nome> no Tailwind (tamanho, altura de linha e fonte).
// O Figma usa 11px em etiquetas e chips; subimos para 12px por legibilidade.
export const textScale = {
  hero: { size: 29, family: fontFamily.extraBold },
  brand: { size: 24, family: fontFamily.extraBold },
  display: { size: 26, family: fontFamily.extraBold },
  title: { size: 22, family: fontFamily.extraBold },
  // Título no topo de uma tela com botões ao lado (ex.: quadro), um pouco menor que o title.
  'header-title': { size: 20, family: fontFamily.extraBold },
  subtitle: { size: 17, family: fontFamily.extraBold },
  'card-title': { size: 15, family: fontFamily.extraBold },
  body: { size: 14, family: fontFamily.medium },
  label: { size: 13, family: fontFamily.extraBold },
  caption: { size: 12, family: fontFamily.medium },
  tag: { size: 12, family: fontFamily.extraBold },
  meta: { size: 12, family: fontFamily.bold },
} as const satisfies Record<string, TextScaleEntry>;

export type TextScaleToken = keyof typeof textScale;
