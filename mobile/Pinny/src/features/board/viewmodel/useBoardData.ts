import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { ptBR } from '@/i18n/pt-BR';

import { type BoardData, emptyColumnIdsOf, loadBoard } from '../model/boardData';
import { assignEmptyVariants, type EmptyVariantMap } from '../model/emptyVariants';
import { type BoardColumnItem, toColumnItems } from './boardItems';

const text = ptBR.board;

// Dados do quadro: carrega ao abrir e recarrega a cada mudança no banco (inclusive as feitas por
// esta tela). Coluna nova na recarga (criada ou devolvida pelo "Desfazer") vira um pedido de foco.
export function useBoardData(boardId: string) {
  // Dados do quadro, o estado vazio sorteado de cada coluna vazia e as colunas prontas para exibir,
  // atualizados juntos: a coluna que esvazia já aparece com a variação dela, quem já tinha uma
  // continua com a mesma, e as colunas e cartões que não mudaram mantêm o mesmo objeto (não são
  // redesenhados).
  const [board, setBoard] = useState<{
    data: BoardData | null;
    emptyVariants: EmptyVariantMap;
    columns: BoardColumnItem[];
  }>({ data: null, emptyVariants: {}, columns: [] });
  const setData = useCallback((next: BoardData | null) => {
    setBoard((current) => {
      const emptyVariants = assignEmptyVariants(emptyColumnIdsOf(next), current.emptyVariants);
      return {
        data: next,
        emptyVariants,
        columns: toColumnItems(next, emptyVariants, current.columns, new Date()),
      };
    });
  }, []);
  const [errorText, setErrorText] = useState<string | null>(null);
  // Coluna que acabou de aparecer: o quadro rola até ela. Um objeto novo a cada pedido, para a
  // mesma coluna poder ser focada de novo (desfazer e refazer).
  const [focusRequest, setFocusRequest] = useState<{ columnId: string } | null>(null);

  useEffect(() => {
    let isActive = true;
    // Colunas da última carga (null = ainda não carregou: na abertura, nada é "novo").
    let knownColumnIds: ReadonlySet<string> | null = null;
    const reload = () => {
      loadBoard(boardId)
        .then((result) => {
          if (!isActive) return;
          // Quadro apagado com a tela aberta (ex.: desfazer a duplicação dentro da cópia): volta.
          if (!result) {
            router.back();
            return;
          }
          const ids = result.columns.map((item) => item.column.id);
          const added = knownColumnIds ? ids.find((id) => !knownColumnIds?.has(id)) : undefined;
          knownColumnIds = new Set(ids);
          setData(result);
          setErrorText(null);
          if (added) setFocusRequest({ columnId: added });
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar o quadro.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };

    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [boardId, setData]);

  const reportSaveError = useCallback(() => setErrorText(ptBR.common.saveError), []);

  return {
    data: board.data,
    columns: board.columns,
    setData,
    errorText,
    reportSaveError,
    focusRequest,
    setFocusRequest,
  };
}
