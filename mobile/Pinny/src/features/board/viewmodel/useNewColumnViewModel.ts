import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { Card } from '@/features/card/model/card.schema';
import { cardRepository } from '@/features/card/model/cardRepository';
import type { UndoOperation } from '@/features/history/model/actionHistory';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { moveCards } from '../model/cardBatch';
import { columnRepository } from '../model/columnRepository';
import { labelRepository } from '../model/labelRepository';
import { cardsMovedSignal } from './cardsMovedSignal';

const text = ptBR.board.newColumn;

// Folha "Nova coluna", aberta pela coluna "Adicionar coluna" no fim do quadro (ou soltando nela um
// cartão ou a pilha do arraste em lote: aí os cartões vão para a coluna nova, na ordem dada). A
// coluna entra no fim do quadro e no histórico como uma ação só (chacoalhar desfaz tudo); o quadro
// recarrega sozinho e rola até ela.
export function useNewColumnViewModel(boardId: string, cardIds?: readonly string[]) {
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  const idsKey = cardIds?.join() ?? '';
  useEffect(() => {
    if (!idsKey) return;
    let isActive = true;
    Promise.all(idsKey.split(',').map((id) => cardRepository.getById(id)))
      .then((found) => {
        if (isActive) setCards(found.filter((card): card is Card => card !== null));
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar os cartões.', error);
      });
    return () => {
      isActive = false;
    };
  }, [idsKey]);

  const create = useCallback(async () => {
    const title = name.trim();
    if (!title) return;
    try {
      const column = await columnRepository.create(boardId, title);
      // Desfaz na ordem: os cartões voltam para onde estavam e depois a coluna some.
      const undo: UndoOperation[] = [];
      if (cards.length > 0) {
        undo.push(
          await moveCards(
            cards.map((card) => card.id),
            { columnId: column.id, toBoardId: null },
            { cards: cardRepository, labels: labelRepository },
          ),
        );
      }
      undo.push({ kind: 'deleteColumn', columnId: column.id });
      historyStore.record(
        ptBR.history.actions.createColumn,
        undo.length === 1 && undo[0] ? undo[0] : { kind: 'sequence', operations: undo },
      );
      // A pilha do arraste em lote foi para a coluna: o quadro sai do modo de seleção.
      if (cards.length > 1) cardsMovedSignal.emit();
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao criar a coluna.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [boardId, cards, name]);

  const [first] = cards;
  return {
    name,
    errorText,
    cardNotice:
      cards.length > 1
        ? text.cardsNotice(cards.length)
        : first
          ? text.cardNotice(first.title)
          : null,
    canCreate: name.trim().length > 0,
    changeName: setName,
    create,
  };
}
