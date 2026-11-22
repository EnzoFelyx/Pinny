// Aviso de mudança do banco nos testes: o SQLite em memória (better-sqlite3) não avisa as telas
// como o expo-sqlite faz no app. Os testes de ViewModel chamam emitDataChange() depois de mudar o
// banco, como o aviso de verdade faria (src/db/changes.ts).
const listeners = new Set<() => void>();

export function subscribeToDataChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChange(): void {
  for (const listener of [...listeners]) listener();
}
