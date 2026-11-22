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
      // Nenhum arquivo existe de verdade nos testes (o tamanho da foto fica de fora).
      exists = false;
      size = 0;
      constructor(directory: { uri: string }, path: string) {
        this.uri = `${directory.uri}${path}`;
      }
    },
  };
});

// Aviso de mudança do banco: o expo-sqlite não roda no Jest; os testes avisam com
// emitDataChange() (src/test/dataChanges.ts).
jest.mock('@/db/changes', () => jest.requireActual('./dataChanges'));

// Navegação: sem navegador nos testes de ViewModel. As funções viram jest.fn() para os testes
// conferirem se a tela fechou (router.back) ou travou o fechar (usePreventRemove).
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useFocusEffect: jest.fn(),
  usePreventRemove: jest.fn(),
}));

// Chacoalhar: sem acelerômetro nem a opção do iOS nos testes. Sem chacoalhar, o aviso de desfazer
// sempre traz o botão "Desfazer" (o que os testes conferem no snackbar).
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: () => Promise.resolve(false),
    setUpdateInterval: jest.fn(),
    addListener: () => ({ remove: jest.fn() }),
  },
}));
jest.mock('@/modules/shake-to-undo', () => ({
  isShakeToUndoEnabledAsync: () => Promise.resolve(false),
}));

// Câmera e galeria: os testes de ViewModel trocam o photoService inteiro; estes mocks só deixam o
// arquivo dele ser importado.
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

// Área segura (entalhe e indicador de início): o mock publicado pela própria biblioteca, com
// margens zeradas.
jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock');
  return mock.default;
});
