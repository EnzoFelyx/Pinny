// Mocks dos módulos nativos que não rodam no Jest (Node). Ficam todos aqui.

// IDs: o mesmo formato (UUID v4), gerado pelo Node.
jest.mock('expo-crypto', () => {
  const { randomUUID } = jest.requireActual<typeof import('crypto')>('crypto');
  return { randomUUID: () => randomUUID() };
});

// Banco: o app abre o arquivo pinny.db pelo expo-sqlite; nos testes, um SQLite em memória com as
// migrações de verdade (um por arquivo de teste). Testes de repositório criam o próprio banco
// com createTestDatabase() e o passam à fábrica do repositório.
jest.mock('@/db/client', () => {
  const { createTestDatabase } =
    jest.requireActual<typeof import('./testDatabase')>('./testDatabase');
  return { DATABASE_NAME: 'pinny-test.db', db: createTestDatabase() };
});
