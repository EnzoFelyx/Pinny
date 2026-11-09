// Único arquivo do app com valores de cor (REGRAS.md, regra 2).
// Valores extraídos do Figma; contraste conferido na seção 4 do CLAUDE.md.

const palette = {
  cream50: '#FBF8F1',
  cream0: '#FFFEFB',
  sand100: '#EFECE5',
  sand200: '#E8E2D8',
  sand300: '#E0D9CD',
  stone500: '#8B867E',
  stone600: '#6F6A62',
  ink900: '#39352F',
  lavender100: '#F2ECF7',
  lavender200: '#EAE1F4',
  violet600: '#776098',
  violet700: '#604A80',
  mint200: '#DDEDE2',
  peach200: '#F6DECE',
  babyBlue200: '#DDEAF2',
  butter200: '#F6EDBE',
  terracotta700: '#9E4D42',
  // Vermelho-coral vivo, só para ícones (4:1 sobre o creme; texto continua em terracotta700).
  coral600: '#D9493C',
  honey800: '#8A622D',
  green600: '#537360',
  blue600: '#4F6F86',
  shadowCard: 'rgba(81, 68, 53, 0.05)',
  shadowLifted: 'rgba(81, 68, 53, 0.15)',
  inkOverlay: 'rgba(57, 53, 47, 0.4)',
  // violet600 (#776098) a 55%: borda da coluna "Adicionar coluna" (Figma "Ghost column").
  violet600Soft: 'rgba(119, 96, 152, 0.55)',
  // Fundo vazio (ex.: espaço tracejado na coluna de origem do arraste).
  clear: 'rgba(0, 0, 0, 0)',
} as const;

export const colors = {
  background: palette.cream50,
  surface: palette.cream0,
  columnBackground: palette.sand100,
  overlay: palette.inkOverlay,

  textPrimary: palette.ink900,
  textSecondary: palette.stone600,
  textOnPrimary: palette.cream0,
  textDisabled: palette.stone600,

  border: palette.sand200,
  borderStrong: palette.stone500,
  borderSelected: palette.violet600,

  primary: palette.violet600,
  secondary: palette.lavender100,
  onSecondary: palette.violet700,
  disabledBackground: palette.sand100,

  // Snackbar: superfície escura para se destacar sobre o quadro.
  inverseSurface: palette.ink900,
  onInverseSurface: palette.cream0,
  inverseAction: palette.lavender200,

  alert: palette.terracotta700,
  // Ícone de ação destrutiva nos botões de vidro (ex.: lixeira do modo de seleção).
  destructiveIcon: palette.coral600,

  // Espaço tracejado onde o cartão arrastado vai cair. A borda e o texto (primary) têm 4,55:1 sobre
  // a coluna e ~4,9:1 sobre o fundo do destino. Na coluna de origem, só a borda; em outra coluna,
  // preenchido.
  dropZoneBorder: palette.violet600,
  dropZoneOriginBackground: palette.clear,
  dropZoneTargetBackground: palette.lavender100,

  // Barras do skeleton loading (decorativas): um tom acima do fundo da coluna e do cartão, com a
  // faixa de brilho do shimmer passando por cima.
  skeleton: palette.sand300,
  skeletonHighlight: palette.cream50,

  // Coluna "Adicionar coluna" no fim do quadro: borda decorativa (quem identifica o botão é o
  // ícone, em onSecondary, 6,5:1 ou mais).
  addColumnBorder: palette.violet600Soft,

  // Linha embaixo do título do quadro em edição: decorativa (o cursor e a seleção mostram a
  // edição), num roxo mais claro que o primary.
  inlineEditBorder: palette.violet600Soft,

  lavender: palette.lavender200,
  mint: palette.mint200,
  peach: palette.peach200,
  babyBlue: palette.babyBlue200,
  butter: palette.butter200,

  // Versão escura de cada acento: ícone e miniatura da pasta (≥ 4,4:1 nas superfícies).
  lavenderInk: palette.violet600,
  mintInk: palette.green600,
  peachInk: palette.terracotta700,
  babyBlueInk: palette.blue600,
  butterInk: palette.honey800,

  illustrationLine: palette.honey800,
} as const;

export type ColorToken = keyof typeof colors;

// Formato boxShadow (CSS), aceito pelo Tailwind (shadow-card) e pela prop style do RN.
export const shadows = {
  card: `0px 4px 6px ${palette.shadowCard}`,
  lifted: `0px 12px 24px ${palette.shadowLifted}`,
} as const;
