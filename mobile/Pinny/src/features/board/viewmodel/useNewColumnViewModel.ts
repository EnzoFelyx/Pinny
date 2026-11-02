import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { Card } from '@/features/card/model/card.schema';
import { cardRepository } from '@/features/card/model/cardRepository';
import type { UndoOperation } from '@/features/history/model/actionHistory';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { columnRepository } from '../model/columnRepository';

// Folha "Nova coluna", aberta pela coluna "Adicionar coluna" no fim do quadro (ou soltando um
// cartão nela: aí o cartão vai para a coluna nova). A coluna entra no fim do quadro e no
// histórico como uma ação só (chacoalhar desfaz tudo); o quadro recarrega sozinho e rola até ela.
export function useNewColumnViewModel(boardId: string, cardId?: string) {
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    if (!cardId) return;
    let isActive = true;
    cardRepository
      .getById(cardId)
      .then((found) => {
        if (isActive) setCard(found);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar o cartão.', error);
      });
    return () => {
      isActive = false;
    };
  }, [cardId]);

  const create = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      const column = await columnRepository.create(boardId, title);
      // Desfaz na ordem: o cartão volta para onde estava e depois a coluna some.
      const undo: UndoOperation[] = [];
      if (card) {
        await cardRepository.move(card.id, column.id, { previousId: null, nextId: null });
        undo.push({
          kind: 'moveCard',
          cardId: card.id,
          columnId: card.columnId,
          position: card.position,
        });
      }
      undo.push({ kind: 'deleteColumn', columnId: column.id });
      historyStore.record(
        ptBR.history.actions.createColumn,
        undo.length === 1 ? undo[0] : { kind: 'sequence', operations: undo },
      );
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao criar a coluna.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [boardId, card, name]);

  return {
    name,
    errorText,
    cardNotice: card ? ptBR.board.newColumn.cardNotice(card.title) : null,
    canCreate: name.trim().length > 0,
    changeName: setName,
    create,
  };
}
