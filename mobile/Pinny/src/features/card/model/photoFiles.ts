import { File, Paths } from 'expo-file-system';

// Endereço da foto guardada no app a partir do caminho relativo gravado no banco (o caminho
// absoluto da pasta do app muda a cada atualização no iOS).
export function photoUri(path: string): string {
  return new File(Paths.document, path).uri;
}
