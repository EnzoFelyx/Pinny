import { addDatabaseChangeListener } from 'expo-sqlite';

// Avisa quando qualquer tabela muda (ex.: pasta criada pelo "+" da tab bar),
// para as telas recarregarem sem depender de foco. Devolve a função de cancelar.
export function subscribeToDataChanges(listener: () => void): () => void {
  const subscription = addDatabaseChangeListener(listener);
  return () => subscription.remove();
}
