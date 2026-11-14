import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { labelRepository } from '@/features/board/model/labelRepository';
import { subscribeToDataChanges } from '@/db/changes';
import { PRIORITIES } from '@/db/schema';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import { type CardDetail, loadCardDetail } from '../model/cardDetail';
import type { Priority } from '../model/card.types';
import { setCardLabels, updateCardFields } from '../model/cardEdits';
import { cardRepository } from '../model/cardRepository';

const text = ptBR.card.labels;

// Folha "Prioridade e etiquetas" do cartão: escolhe a prioridade e marca e desmarca as etiquetas
// do quadro (tudo grava na hora, com desfazer). "Nova etiqueta" abre a própria folha
// (useNewLabelViewModel).
export function useCardLabelsViewModel(cardId: string) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadCardDetail(cardId)
        .then((result) => {
          if (!isActive || !result) return;
          setDetail(result);
          setErrorText(null);
        })
        .catch((error: unknown) => {
          console.warn('Falha ao carregar as etiquetas.', error);
          if (isActive) setErrorText(text.loadError);
        });
    };
    reload();
    const unsubscribe = subscribeToDataChanges(reload);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [cardId]);

  const boardLabels = detail?.boardLabels ?? [];
  const selectedIds = (detail?.labels ?? []).map((label) => label.id);
  // Grava as etiquetas do cartão (na ordem do quadro) e registra o desfazer.
  const saveLabels = useCallback(
    async (labelIds: readonly string[]) => {
      try {
        const undo = await setCardLabels(cardId, labelIds, labelRepository);
        historyStore.record(ptBR.history.actions.editCard, undo);
      } catch (error: unknown) {
        console.warn('Falha ao salvar as etiquetas.', error);
        setErrorText(ptBR.common.saveError);
      }
    },
    [cardId],
  );

  const toggle = (labelId: string) => {
    const next = selectedIds.includes(labelId)
      ? selectedIds.filter((id) => id !== labelId)
      : [...selectedIds, labelId];
    void saveLabels(next);
  };

  // Prioridade: escolha única, grava na hora (null = sem prioridade).
  const priority = detail?.card.priority ?? null;
  const setPriority = (next: Priority | null) => {
    if (next === priority) return;
    void (async () => {
      try {
        const undo = await updateCardFields(cardId, { priority: next }, cardRepository);
        if (undo) historyStore.record(ptBR.history.actions.editCard, undo);
      } catch (error: unknown) {
        console.warn('Falha ao salvar a prioridade.', error);
        setErrorText(ptBR.common.saveError);
      }
    })();
  };

  const openNewLabel = () => {
    router.push({ pathname: '/card/[cardId]/new-label', params: { cardId } });
  };

  return {
    isLoading: detail === null && errorText === null,
    errorText,
    options: boardLabels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      isSelected: selectedIds.includes(label.id),
    })),
    emptyText: detail && boardLabels.length === 0 ? text.empty : null,
    toggle,
    openNewLabel,
    // Da mais alta para a mais baixa (como no filtro do quadro) e, por último, "Nenhuma".
    priorityOptions: [...[...PRIORITIES].reverse(), null].map((value) => ({
      value,
      accessibilityLabel: value ? ptBR.card.priorityA11y[value] : text.noPriorityA11y,
      isSelected: value === priority,
    })),
    setPriority,
  };
}
