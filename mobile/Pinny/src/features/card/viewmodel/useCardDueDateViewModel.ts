import { router, usePreventRemove } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { historyStore } from '@/features/history/model/historyStore';
import type { DestructiveConfirmRequest } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';

import type { CardPatch } from '../model/cardRepository';
import { cardRepository } from '../model/cardRepository';
import { updateCardFields } from '../model/cardEdits';
import { initialDueDate } from '../model/deadline';

const text = ptBR.card.dueDate;

const DISCARD_REQUEST: DestructiveConfirmRequest = {
  title: text.discardTitle,
  message: text.discardMessage,
  confirmLabel: text.discardConfirm,
  cancelLabel: text.discardCancel,
};

// Folha "Data e horário" do cartão. O calendário muda só o rascunho (cada toque nele gravaria
// uma ação no histórico); "Salvar" grava o prazo e "Remover prazo" o apaga, os dois com desfazer.
// Puxar para fechar com o rascunho diferente do que abriu pede "Descartar alterações?" (padrão do
// iOS para folhas com edição não salva); sem mudança, fecha direto.
export function useCardDueDateViewModel(cardId: string) {
  const [initial, setInitial] = useState<Date | null>(null);
  const [draft, setDraft] = useState<Date | null>(null);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isDiscardAsked, setIsDiscardAsked] = useState(false);
  // Salvou, removeu ou descartou: a folha fecha sem a trava (o efeito abaixo volta depois que a
  // trava sai, num novo render).
  const [isClosing, setIsClosing] = useState(false);

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
        const start = initialDueDate(card.dueAt, new Date());
        setInitial(start);
        setDraft(start);
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

  useEffect(() => {
    if (isClosing) router.back();
  }, [isClosing]);

  const hasChanges = draft !== null && initial !== null && draft.getTime() !== initial.getTime();
  usePreventRemove(hasChanges && !isClosing, () => setIsDiscardAsked(true));

  const saveDueAt = async (dueAt: CardPatch['dueAt']) => {
    try {
      const undo = await updateCardFields(cardId, { dueAt }, cardRepository);
      if (undo) historyStore.record(ptBR.history.actions.editCard, undo);
      setIsClosing(true);
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

  const confirmDiscard = useCallback(() => {
    setIsDiscardAsked(false);
    setIsClosing(true);
  }, []);
  const cancelDiscard = useCallback(() => setIsDiscardAsked(false), []);

  return {
    isLoading: draft === null && errorText === null,
    errorText,
    selection: draft,
    changeDate: setDraft,
    canRemove: hasDueDate,
    save,
    remove,
    discardRequest: isDiscardAsked ? DISCARD_REQUEST : null,
    confirmDiscard,
    cancelDiscard,
  };
}
