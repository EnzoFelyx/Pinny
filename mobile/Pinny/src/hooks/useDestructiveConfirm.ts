import { useEffect } from 'react';
import { Alert } from 'react-native';

// Pedido de confirmação com o texto já pronto (vem do ViewModel).
export interface DestructiveConfirmRequest {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  // default = botão comum (ex.: "Abrir Ajustes"); sem ele, o botão de confirmar é vermelho.
  confirmStyle?: 'default' | 'destructive';
}

interface DestructiveConfirmHandlers {
  onConfirm: () => void;
  // Cancelar, tocar fora ou fechar o alerta.
  onCancel: () => void;
}

// Alerta nativo de confirmação (ex.: apagar coluna ou quadro, ou abrir os Ajustes). Abre
// sempre que chega um pedido; null = nada a confirmar.
export function useDestructiveConfirm(
  request: DestructiveConfirmRequest | null,
  { onConfirm, onCancel }: DestructiveConfirmHandlers,
) {
  useEffect(() => {
    if (!request) return;
    Alert.alert(
      request.title,
      request.message,
      [
        { text: request.cancelLabel, style: 'cancel', onPress: onCancel },
        {
          text: request.confirmLabel,
          style: request.confirmStyle ?? 'destructive',
          onPress: onConfirm,
        },
      ],
      { cancelable: true, onDismiss: onCancel },
    );
  }, [request, onConfirm, onCancel]);
}
