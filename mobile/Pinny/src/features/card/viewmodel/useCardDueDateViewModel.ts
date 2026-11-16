import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import type { CardPatch } from '../model/cardRepository';
import { cardRepository } from '../model/cardRepository';
import { updateCardFields } from '../model/cardEdits';
import { initialDueDate } from '../model/deadline';

const text = ptBR.card.dueDate;

// Folha "Data e horário" do cartão. O calendário muda só o rascunho (cada toque nele gravaria
// uma ação no histórico); "Salvar" grava o prazo e "Remover prazo" o apaga, os dois com desfazer.
// Fechar a folha puxando descarta o rascunho.
export function useCardDueDateViewModel(cardId: string) {
  const [draft, setDraft] = useState<Date | null>(null);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    cardRepository
      .getById(cardId)
      .then((card) => {
        if (!isActive) return;
        if (!card) {
          router.back();
          return;
        }
        setDraft(initialDueDate(card.dueAt, new Date()));
        setHasDueDate(card.dueAt !== null);
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar o prazo.', error);
        if (isActive) setErrorText(text.loadError);
      });
    return () => {
      isActive = false;
    };
  }, [cardId]);

  const saveDueAt = async (dueAt: CardPatch['dueAt']) => {
    try {
      const undo = await updateCardFields(cardId, { dueAt }, cardRepository);
      if (undo) historyStore.record(ptBR.history.actions.editCard, undo);
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao salvar o prazo.', error);
      setErrorText(ptBR.common.saveError);
    }
  };

  const save = () => {
    if (draft) void saveDueAt(draft.toISOString());
  };
  const remove = () => {
    void saveDueAt(null);
  };

  return {
    isLoading: draft === null && errorText === null,
    errorText,
    selection: draft,
    changeDate: setDraft,
    canRemove: hasDueDate,
    save,
    remove,
  };
}
