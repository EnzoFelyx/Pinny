import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  seedStressBoard,
  STRESS_SIZES,
  type StressSize,
} from '@/features/dev/model/devDataService';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.settings;
const MS_PER_SECOND = 1000;

// Configurações completas chegam na etapa 12.
export function useSettingsViewModel() {
  const [devFeedback, setDevFeedback] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Quadro superlotado para testar performance: mostra quantos cartões e quanto tempo levou.
  const createStressBoard = useCallback(async (size: StressSize) => {
    setIsSeeding(true);
    setDevFeedback(text.stressCreating);
    const startedAt = Date.now();
    try {
      const cardCount = await seedStressBoard(size);
      const seconds = ((Date.now() - startedAt) / MS_PER_SECOND).toFixed(1);
      setDevFeedback(text.stressCreated(cardCount, seconds));
    } catch (error: unknown) {
      console.warn('Falha ao criar o quadro superlotado.', error);
      setDevFeedback(text.stressError);
    } finally {
      setIsSeeding(false);
    }
  }, []);

  return {
    // A galeria de componentes e os testes de performance só existem em desenvolvimento.
    showDeveloperTools: __DEV__,
    openComponentGallery: useCallback(() => router.push('/dev/gallery'), []),
    devFeedback,
    isSeeding,
    createHeavyBoard: useCallback(() => createStressBoard(STRESS_SIZES.heavy), [createStressBoard]),
    createExtremeBoard: useCallback(
      () => createStressBoard(STRESS_SIZES.extreme),
      [createStressBoard],
    ),
  };
}
