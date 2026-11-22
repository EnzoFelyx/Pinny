// Mocks dos módulos nativos que não rodam no Jest (Node). Ficam todos aqui.
import { setUpTests } from 'react-native-reanimated';

// Animações: sem a UI thread nativa, o Reanimated roda em JavaScript (o resolver do
// jest.config.js escolhe os arquivos certos) e setUpTests registra os matchers de estilo animado.
setUpTests();

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

// Arquivos: as fotos ficam na pasta de documentos do app; nos testes, um endereço de mentira.
jest.mock('expo-file-system', () => {
  const documentUri = 'file:///documents/';
  return {
    Paths: { document: { uri: documentUri } },
    File: class {
      uri: string;
      constructor(directory: { uri: string }, path: string) {
        this.uri = `${directory.uri}${path}`;
      }
    },
  };
});

// Área segura (entalhe e indicador de início): o mock publicado pela própria biblioteca, com
// margens zeradas.
jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock');
  return mock.default;
});
