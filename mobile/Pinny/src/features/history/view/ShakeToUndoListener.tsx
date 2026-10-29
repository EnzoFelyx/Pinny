import { useEffect } from 'react';
import { Alert } from 'react-native';

import { useShakeToUndo } from '../viewmodel/useShakeToUndo';

// Sem interface própria: ao chacoalhar, mostra o alerta nativo do iOS (UIAlertController)
// com desfazer e/ou refazer e "Cancelar".
export function ShakeToUndoListener() {
  const { prompt, cancelLabel, choose, dismiss } = useShakeToUndo();

  useEffect(() => {
    if (!prompt) return;
    Alert.alert(
      prompt.title ?? '',
      undefined,
      [
        ...prompt.options.map((option) => ({
          text: option.label,
          onPress: () => {
            choose(option.choice).catch((error: unknown) => console.warn(error));
          },
        })),
        { text: cancelLabel, style: 'cancel' as const, onPress: dismiss },
      ],
      { cancelable: true, onDismiss: dismiss },
    );
  }, [prompt, cancelLabel, choose, dismiss]);

  return null;
}
