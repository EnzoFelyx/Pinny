import { addDatabaseChangeListener } from 'expo-sqlite';

import { DATA_CHANGE_SETTLE_MS } from '@/constants/limits';

// Avisa quando qualquer tabela muda (ex.: pasta criada pelo "+" da tab bar), para as telas
// recarregarem sem depender de foco. O SQLite avisa uma vez por linha alterada: uma leva de
// avisos (ex.: copiar uma coluna inteira) vira um aviso só, quando os avisos param de chegar.
// Devolve a função de cancelar.
export function subscribeToDataChanges(listener: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const subscription = addDatabaseChangeListener(() => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      listener();
    }, DATA_CHANGE_SETTLE_MS);
  });
  return () => {
    if (timer !== null) clearTimeout(timer);
    subscription.remove();
  };
}
