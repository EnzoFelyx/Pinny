import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { colors, shadows } from './src/theme/colors';
import { LINE_HEIGHT_RATIO, textScale } from './src/theme/typography';

// Os valores vêm de src/theme: este arquivo só traduz os tokens para classes.

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// bg-surface, text-text-primary, border-border-strong...
const colorClasses = Object.fromEntries(
  Object.entries(colors).map(([token, value]) => [toKebabCase(token), value]),
);

// text-display, text-card-title... (tamanho + altura de linha + fonte em uma classe)
const textClasses = Object.fromEntries(
  Object.entries(textScale).map(([name, { size, family }]) => [
    `.text-${name}`,
    {
      fontSize: `${size}px`,
      lineHeight: `${Math.round(size * LINE_HEIGHT_RATIO)}px`,
      fontFamily: family,
    },
  ]),
);

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // Substitui a paleta padrão do Tailwind: só os tokens do app existem (nada de bg-white, text-red-500).
    colors: {
      transparent: 'transparent',
      ...colorClasses,
    },
    fontSize: {},
    fontFamily: {},
    boxShadow: {
      none: 'none',
      card: shadows.card,
      lifted: shadows.lifted,
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities(textClasses);
    }),
  ],
};

export default config;
