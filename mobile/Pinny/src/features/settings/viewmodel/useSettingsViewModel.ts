import { useCallback, useState } from 'react';

import { LARGE_FOLDER_SIZES, seedLargeFolder } from '@/features/dev/model/devFolderSeed';
import {
  seedStressBoard,
  STRESS_SIZES,
  type StressSize,
} from '@/features/dev/model/devDataService';
import { ptBR } from '@/i18n/pt-BR';
import { openRoute } from '@/navigation/openRoute';

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

  // Pasta com muitos quadros, para ver o "+N quadros" da Início e a tela da pasta.
  const createLargeFolder = useCallback(async (boardCount: number) => {
    setIsSeeding(true);
    try {
      await seedLargeFolder(boardCount);
      setDevFeedback(text.largeFolderCreated(boardCount));
    } catch (error: unknown) {
      console.warn('Falha ao criar a pasta grande.', error);
      setDevFeedback(text.largeFolderError);
    } finally {
      setIsSeeding(false);
    }
  }, []);

  return {
    // A galeria de componentes e os testes de performance só existem em desenvolvimento.
    showDeveloperTools: __DEV__,
    openComponentGallery: useCallback(() => openRoute('/dev/gallery'), []),
    devFeedback,
    isSeeding,
    createHeavyBoard: useCallback(() => createStressBoard(STRESS_SIZES.heavy), [createStressBoard]),
    createExtremeBoard: useCallback(
      () => createStressBoard(STRESS_SIZES.extreme),
      [createStressBoard],
    ),
    largeFolderOptions: Object.values(LARGE_FOLDER_SIZES).map((boardCount) => ({
      boardCount,
      label: text.largeFolder(boardCount),
      create: () => createLargeFolder(boardCount),
    })),
  };
}
