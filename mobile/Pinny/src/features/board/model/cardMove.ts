import { type CardRepository, cardRepository } from '@/features/card/model/cardRepository';
import { historyStore } from '@/features/history/model/historyStore';
import type { Placement } from '@/utils/position';

// Onde o cartão estava antes de mover: é para lá que o "Desfazer" o devolve.
export interface CardOrigin {
  columnId: string;
  position: number;
}

// Grava o movimento (só o cartão, na mesma coluna ou em outra) e o registra no histórico.
// Usado pelo arraste do quadro e pela folha "Mover para...".
export async function moveCardWithHistory(
  cardId: string,
  toColumnId: string,
  placement: Placement,
  origin: CardOrigin,
  description: string,
  cards: CardRepository = cardRepository,
): Promise<void> {
  await cards.move(cardId, toColumnId, placement);
  historyStore.record(description, {
    kind: 'moveCard',
    cardId,
    columnId: origin.columnId,
    position: origin.position,
  });
}
