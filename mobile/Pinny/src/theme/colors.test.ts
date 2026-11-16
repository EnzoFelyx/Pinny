import { contrastRatio } from '@/test/contrast';

import { type ColorToken, colors } from './colors';

// Contraste WCAG 2.1 AA dos tokens (CLAUDE.md, seção 12, regra 14). O app só tem tema claro.
// Cada par é [frente, fundo] como o app usa de verdade; um token novo de texto entra aqui.
type Pair = [foreground: ColorToken, background: ColorToken];

const TEXT_MINIMUM = 4.5;
const NON_TEXT_MINIMUM = 3;

const SURFACES: ColorToken[] = ['background', 'surface', 'columnBackground'];
const ACCENTS: ColorToken[] = ['lavender', 'mint', 'peach', 'babyBlue', 'butter'];
const onEach = (foreground: ColorToken, backgrounds: ColorToken[]): Pair[] =>
  backgrounds.map((background) => [foreground, background]);

const textPairs: Pair[] = [
  // Texto principal: nas superfícies, nos acentos (etiquetas e chips) e no marca-texto da busca.
  ...onEach('textPrimary', [...SURFACES, ...ACCENTS, 'secondary', 'searchHighlight']),
  ...onEach('textSecondary', [...SURFACES, 'secondary']),
  // Botões: primário, secundário e desabilitado.
  ['textOnPrimary', 'primary'],
  ...onEach('onSecondary', [...SURFACES, 'secondary']),
  ['textDisabled', 'disabledBackground'],
  // Snackbar.
  ['onInverseSurface', 'inverseSurface'],
  ['inverseAction', 'inverseSurface'],
  // Mensagens de erro e o chip de prazo vencido / prioridade alta (sobre o pêssego).
  ...onEach('alert', [...SURFACES, 'peach']),
  // "Solte para reorganizar", na vaga do arraste.
  ...onEach('dropZoneBorder', ['columnBackground', 'dropZoneTargetBackground']),
];

const nonTextPairs: Pair[] = [
  // Borda de input e trilho do toggle desligado.
  ...onEach('borderStrong', SURFACES),
  // Ícones, seleção e a borda do cartão marcado.
  ...onEach('primary', [...SURFACES, 'secondary']),
  ...onEach('borderSelected', SURFACES),
  // Lixeira dos botões de vidro.
  ...onEach('destructiveIcon', ['background', 'surface']),
  // Ícone da pasta e do quadro, na cor escura de cada acento.
  ...onEach('lavenderInk', SURFACES),
  ...onEach('mintInk', SURFACES),
  ...onEach('peachInk', SURFACES),
  ...onEach('babyBlueInk', SURFACES),
  ...onEach('butterInk', SURFACES),
  ...onEach('illustrationLine', ['background', 'surface']),
];

describe('color contrast (WCAG 2.1 AA)', () => {
  test.each(textPairs)('text %s on %s has at least 4.5:1', (foreground, background) => {
    const ratio = contrastRatio(colors[foreground], colors[background]);

    expect(ratio).toBeGreaterThanOrEqual(TEXT_MINIMUM);
  });

  test.each(nonTextPairs)('icon or border %s on %s has at least 3:1', (foreground, background) => {
    const ratio = contrastRatio(colors[foreground], colors[background]);

    expect(ratio).toBeGreaterThanOrEqual(NON_TEXT_MINIMUM);
  });
});

describe('contrastRatio', () => {
  test('is 21 between black and white and 1 between equal colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrastRatio('#776098', '#776098')).toBe(1);
  });
});
