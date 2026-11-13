import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

interface BoardFocusOptions {
  // Coluna nova (ou devolvida pelo "Desfazer").
  focusRequest: { columnId: string } | null;
  // Busca que sobrou com um cartão só.
  searchMatch: { columnId: string; cardId: string } | null;
  // Quantos cartões a busca encontrou, para o leitor de tela.
  searchResultText: string | null;
  focusColumn: (columnId: string) => void;
}

// O que o quadro faz sozinho: rola até a coluna nova (como ao soltar um cartão), rola até o único
// resultado da busca (de novo a cada cartão novo) e anuncia o resultado da busca ao leitor de
// tela (o subtítulo some enquanto busca).
export function useBoardFocus({
  focusRequest,
  searchMatch,
  searchResultText,
  focusColumn,
}: BoardFocusOptions) {
  useEffect(() => {
    if (focusRequest) focusColumn(focusRequest.columnId);
  }, [focusRequest, focusColumn]);

  const matchColumnId = searchMatch?.columnId;
  const matchCardId = searchMatch?.cardId;
  useEffect(() => {
    if (matchColumnId && matchCardId) focusColumn(matchColumnId);
  }, [matchColumnId, matchCardId, focusColumn]);

  useEffect(() => {
    if (searchResultText) AccessibilityInfo.announceForAccessibility(searchResultText);
  }, [searchResultText]);
}
