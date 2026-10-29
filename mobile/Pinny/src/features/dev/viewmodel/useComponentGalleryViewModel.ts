import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { galleryCards } from '../model/gallerySamples';

// Largura da coluna em relação à tela: a próxima coluna aparece pela borda (dica de rolagem).
const COLUMN_WIDTH_RATIO = 0.75;
export const COLUMN_GAP = 12;

export function useComponentGalleryViewModel() {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = Math.round(screenWidth * COLUMN_WIDTH_RATIO);
  const [isToggleOn, setIsToggleOn] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const [folderName, setFolderName] = useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  return {
    cards: galleryCards,
    columnWidth,
    // Cada "página" da rolagem horizontal é uma coluna mais o espaço entre elas.
    columnSnapInterval: columnWidth + COLUMN_GAP,
    isToggleOn,
    isChecked,
    folderName,
    isSnackbarVisible,
    changeToggle: setIsToggleOn,
    toggleChecked: useCallback(() => setIsChecked((value) => !value), []),
    changeFolderName: setFolderName,
    // A folha da galeria é a "Nova pasta" de verdade (folha nativa do iOS).
    openSheet: useCallback(() => router.push('/folder/new'), []),
    showSnackbar: useCallback(() => setIsSnackbarVisible(true), []),
    hideSnackbar: useCallback(() => setIsSnackbarVisible(false), []),
    noop: useCallback(() => undefined, []),
  };
}
