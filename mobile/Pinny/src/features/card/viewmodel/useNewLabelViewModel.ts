import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToDataChanges } from '@/db/changes';
import { LABEL_COLORS } from '@/db/schema';
import { labelRepository } from '@/features/board/model/labelRepository';
import { historyStore } from '@/features/history/model/historyStore';
import { ptBR } from '@/i18n/pt-BR';

import type { LabelColor } from '../model/card.types';
import { type CardDetail, loadCardDetail } from '../model/cardDetail';
import { findOrCreateLabel, setCardLabels } from '../model/cardEdits';

const text = ptBR.card.labels;

// A primeira cor que o quadro ainda não usa (todas usadas: a primeira da lista).
function nextColor(used: readonly LabelColor[]): LabelColor {
  return LABEL_COLORS.find((color) => !used.includes(color)) ?? LABEL_COLORS[0];
}

// Folha "Nova etiqueta" (aberta pela folha "Etiquetas" do cartão): nome e cor. Criar já marca no
// cartão e fecha. Nome igual a uma etiqueta do quadro marca a existente em vez de duplicar.
// Desfazer desmarca; a etiqueta criada continua no quadro.
export function useNewLabelViewModel(cardId: string) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [name, setName] = useState('');
  // null = ainda não escolheu: usa a próxima cor livre do quadro.
  const [chosenColor, setChosenColor] = useState<LabelColor | null>(null);

  useEffect(() => {
    let isActive = true;
    const reload = () => {
      loadCardDetail(cardId)
        .then((result) => {
          if (isActive && result) setDetail(result);
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
  const color = chosenColor ?? nextColor(boardLabels.map((label) => label.color));
  const canCreate = detail !== null && name.trim().length > 0;

  const create = useCallback(async () => {
    const trimmed = name.trim();
    if (!detail || !trimmed) return;
    const selectedIds = detail.labels.map((label) => label.id);
    try {
      const label = await findOrCreateLabel(
        detail.board.id,
        { name: trimmed, color },
        detail.boardLabels,
        labelRepository,
      );
      if (!selectedIds.includes(label.id)) {
        const undo = await setCardLabels(cardId, [...selectedIds, label.id], labelRepository);
        historyStore.record(ptBR.history.actions.editCard, undo);
      }
      router.back();
    } catch (error: unknown) {
      console.warn('Falha ao criar a etiqueta.', error);
      setErrorText(ptBR.common.saveError);
    }
  }, [cardId, color, detail, name]);

  return {
    name,
    changeName: setName,
    color,
    colorOptions: LABEL_COLORS,
    chooseColor: setChosenColor,
    canCreate,
    errorText,
    create,
  };
}
