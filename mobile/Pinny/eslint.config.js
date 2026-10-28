// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  {
    // src/db/migrations: gerado pelo drizzle-kit (npm run db:generate).
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'src/db/migrations/*'],
  },
  {
    plugins: { 'react-native': reactNative },
    rules: {
      // REGRAS.md: cores só em src/theme/colors.ts e nada de estilo inline.
      'react-native/no-color-literals': 'error',
      'react-native/no-inline-styles': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXAttribute[name.name='className'] :matches(Literal, TemplateElement)[value=/#[0-9a-fA-F]{3,8}|rgba?\\(|hsla?\\(/]",
          message: 'Cor solta em className. Use um token de src/theme/colors.ts (ex.: bg-surface).',
        },
        {
          selector:
            "JSXAttribute[name.name='className'] TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}|rgba?\\(|hsla?\\(/]",
          message: 'Cor solta em className. Use um token de src/theme/colors.ts (ex.: bg-surface).',
        },
      ],
    },
  },
  prettierRecommended,
]);
