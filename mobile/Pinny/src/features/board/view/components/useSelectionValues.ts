import { useEffect, useMemo } from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

// Modo "Selecionar" do quadro copiado para a UI thread: os cartões desenham a seleção e ligam ou
// desligam o arraste lendo estes valores, sem o React redesenhar os cartões (com centenas deles,
// entrar no modo ou marcar um cartão travava).
export interface SelectionValues {
  // Os marcados (null = fora do modo de seleção).
  marked: SharedValue<Readonly<Record<string, true>> | null>;
  // Arraste em lote em andamento: as bolinhas somem.
  isCheckHidden: SharedValue<boolean>;
}

export function useSelectionValues(
  selectedIds: ReadonlySet<string> | null,
  isCheckHidden: boolean,
): SelectionValues {
  const marked = useSharedValue<Readonly<Record<string, true>> | null>(null);
  const checkHidden = useSharedValue(false);

  useEffect(() => {
    marked.set(
      selectedIds ? Object.fromEntries([...selectedIds].map((id) => [id, true] as const)) : null,
    );
  }, [selectedIds, marked]);
  useEffect(() => {
    checkHidden.set(isCheckHidden);
  }, [isCheckHidden, checkHidden]);

  // Identidade fixa: passa pelas colunas e cartões (memo) sem redesenhá-los.
  return useMemo(() => ({ marked, isCheckHidden: checkHidden }), [marked, checkHidden]);
}
