import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';

import { galleryCards } from '../model/gallerySamples';

export function useComponentGalleryViewModel() {
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  const [isToggleOn, setIsToggleOn] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const [folderName, setFolderName] = useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  return {
    cards: galleryCards,
    columnWidth,
    columnSnapInterval: snapInterval,
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
