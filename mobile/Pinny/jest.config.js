// Testes unitários e de componente (Jest + Testing Library). O preset do Expo cuida do Babel
// (inclusive NativeWind e as migrações .sql como texto) e dos módulos do React Native.
module.exports = {
  preset: 'jest-expo',
  // Os mocks dos módulos nativos ficam num lugar só; o setup limpa o estado global entre testes.
  setupFilesAfterEnv: ['<rootDir>/src/test/nativeMocks.ts', '<rootDir>/jest.setup.ts'],
  // O mesmo alias do tsconfig.json.
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/modules/(.*)$': '<rootDir>/modules/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/ios/', '<rootDir>/android/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Rotas finas do Expo Router: só ligam parâmetros à tela.
    '!src/app/**',
    // Tipos, schemas gerados e helpers de teste não têm lógica própria para cobrir.
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/db/migrations/**',
    '!src/test/**',
    // Ferramentas só de desenvolvimento (__DEV__): galeria e dados de exemplo.
    '!src/features/dev/**',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
};
